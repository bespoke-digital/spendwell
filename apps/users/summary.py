
from decimal import Decimal
from dateutil.relativedelta import relativedelta

from apps.core.utils import months_avg, this_month
from apps.buckets.models import Bucket
from apps.transactions.models import Transaction, IncomeFromSavings


class BucketMonth(object):
    def __init__(self, bucket, month_start=None, month_end=None):
        self.bucket = bucket

        if month_start:
            self.month_start = month_start
        else:
            self.month_start = this_month()

        if month_end:
            self.month_end = month_end
        else:
            self.month_end = self.month_start + relativedelta(months=1)

    @property
    def month(self):
        return self.month_start

    @property
    def transactions(self):
        if not hasattr(self, '_transactions'):
            self._transactions = self.bucket.transactions.filter(
                date__gte=self.month_start,
                date__lt=self.month_end,
            )
        return self._transactions

    @property
    def amount(self):
        if not hasattr(self, '_amount'):
            if self.bucket.type == 'goal':
                self._amount = self.bucket.goal_amount
            else:
                self._amount = self.transactions.sum()
        return self._amount

    @property
    def avg_amount(self):
        if not hasattr(self, '_avg_amount'):
            if self.bucket.type == 'goal':
                self._avg_amount = self.bucket.goal_amount
            else:
                self._avg_amount = months_avg(
                    self.bucket.transactions.all(),
                    month_start=self.month_start,
                )
        return self._avg_amount

    @property
    def bill_due_date(self):
        if not self.bucket.type == 'bill':
            return None

        if hasattr(self, '_bill_due_date'):
            return self._bill_due_date

        dates = []

        for months_ago in range(1, 4):
            month_start = self.month_start - relativedelta(months=months_ago)
            month_end = month_start + relativedelta(months=1)

            transaction = self.bucket.transactions.filter(
                date__gt=month_start,
                date__lt=month_end,
            ).first()

            if not transaction:
                return None

            dates.append(transaction.date.day)

        date_range = max(dates) - min(dates)

        if date_range > 4:
            return None

        self._bill_due_date = self.month_start.replace(day=max(dates) - int(date_range / 2))

        return self._bill_due_date

    @property
    def bill_paid(self, month=None):
        if not self.bucket.type == 'bill':
            return None

        return self.amount <= (self.avg_amount * Decimal('0.95'))


class MonthSummary(object):
    def __init__(self, user, month_start=None, month_end=None):
        self.user = user

        if month_start is None:
            self.month_start = this_month()
        else:
            self.month_start = month_start

        if month_end is None:
            self.month_end = self.month_start + relativedelta(months=1)
        else:
            self.month_end = month_end

        self.is_current_month = self.month_start == this_month()

    def source_transactions(self, **filters):
        return Transaction.objects.filter(
            owner=self.user,
            account__disabled=False,
            date__gte=self.month_start,
            date__lt=self.month_end,
            **filters
        ).is_transfer(False)

    @property
    def true_income(self):
        if not hasattr(self, '_true_income'):
            self._true_income = self.source_transactions().filter(amount__gt=0).sum()
        return self._true_income

    @property
    def from_savings_income(self):
        if not hasattr(self, '_from_savings_income'):
            self._from_savings_income = (
                IncomeFromSavings.objects
                .filter(owner=self.user, month_start=self.month_start)
                .sum('amount')
            )

        return self._from_savings_income

    @property
    def estimated_income(self):
        return self.user.estimated_income

    @property
    def income(self):
        if not hasattr(self, '_income'):
            self._income = self.true_income + self.from_savings_income

            if self.is_current_month and self._income < self.user.estimated_income:
                self._income = self.user.estimated_income + self.from_savings_income
                self._income_estimated = True
            else:
                self._income_estimated = False

        return self._income

    @property
    def income_estimated(self):
        if not hasattr(self, '_income_estimated'):
            self.income
        return self._income_estimated

    @property
    def goals_total(self):
        if not hasattr(self, '_goals_total'):
            goals = Bucket.objects.filter(owner=self.user, type='goal')
            self._goals_total = sum(goal.goal_amount for goal in goals)
        return self._goals_total

    @property
    def bills_unpaid_total(self):
        if not hasattr(self, '_bills_unpaid_total'):
            self._bills_unpaid_total = 0
            self._bills_paid_total = 0

            for bucket in Bucket.objects.filter(owner=self.user, type='bill'):
                bucket_month = BucketMonth(bucket, self.month_start, self.month_end)

                self._bills_paid_total += bucket_month.amount

                if not self.is_current_month:
                    continue

                if not bucket_month.bill_paid:
                    self._bills_unpaid_total += bucket_month.avg_amount - bucket_month.amount

        return self._bills_unpaid_total

    @property
    def bills_paid_total(self):
        if not hasattr(self, '_bills_paid_total'):
            self.bills_unpaid_total
        return self._bills_paid_total

    @property
    def allocated(self):
        if not hasattr(self, '_allocated'):
            self._allocated = self.bills_unpaid_total + self.goals_total
        return self._allocated

    @property
    def spent(self):
        if not hasattr(self, '_spent'):
            self._spent = self.source_transactions(
                amount__lt=0,
                from_savings=False,
            ).sum()
        return self._spent

    @property
    def spent_from_savings(self):
        if not hasattr(self, '_spent_from_savings'):
            self._spent_from_savings = self.source_transactions(
                from_savings=True,
            ).sum()
        return self._spent_from_savings

    @property
    def net(self):
        if not hasattr(self, '_net'):
            self._net = sum([
                self.income,
                self.goals_total,
                self.bills_unpaid_total,
                self.spent,
            ])
        return self._net

    @property
    def bucket_months(self):
        if not hasattr(self, '_bucket_months'):
            self._bucket_months = [
                BucketMonth(bucket, self.month_start, self.month_end)
                for bucket in Bucket.objects.filter(owner=self.user)
            ]
        return self._bucket_months

    @property
    def transactions(self):
        if not hasattr(self, '_transactions'):
            self._transactions = self.source_transactions()
        return self._transactions
