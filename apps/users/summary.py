
import delorean
from dateutil.relativedelta import relativedelta

from apps.core.utils import months_avg, this_month
from apps.buckets.models import Bucket
from apps.transactions.models import Transaction, IncomeFromSavings


def bucket_month(bucket, month):
    transactions = bucket.transactions.filter(
        date__gte=month,
        date__lt=month + relativedelta(months=1),
    )

    if bucket.type == 'goal':
        amount = bucket.goal_amount
        avg_amount = amount
    else:
        amount = bucket.transactions.sum()
        avg_amount = months_avg(bucket.transactions.all(), month_start=month)

    return {
        'bucket': bucket,
        'month': month,
        'transactions': transactions,
        'amount': amount,
        'avg_amount': avg_amount,
    }


class MonthSummary(object):
    def __init__(self, user, month_start=None):
        self.user = user

        if month_start is None:
            self.month_start = delorean.now().truncate('month').datetime
        else:
            self.month_start = month_start

    def source_transactions(self, **filters):
        return Transaction.objects.filter(
            owner=self.user,
            account__disabled=False,
            date__lt=self.month_start + relativedelta(months=1),
            date__gte=self.month_start,
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

            current_month = relativedelta(self.month_start, delorean.now().datetime).months == 0
            if current_month and self._income < self.user.estimated_income:
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

            calculate_unpaid = this_month() == self.month_start

            for bucket in Bucket.objects.filter(owner=self.user, type='bill'):
                bill_month = bucket_month(bucket, self.month_start)

                self._bills_paid_total += bill_month['amount']

                if not calculate_unpaid:
                    continue

                if bill_month['amount'] > bill_month['avg_amount']:
                    self._bills_unpaid_total -= abs(bill_month['avg_amount']) - abs(bill_month['amount'])

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
        from .schema import BucketMonthNode
        if not hasattr(self, '_bucket_months'):
            self._bucket_months = [
                BucketMonthNode(**bucket_month(bucket, self.month_start))
                for bucket in Bucket.objects.filter(owner=self.user)
            ]
        return self._bucket_months

    @property
    def transactions(self):
        if not hasattr(self, '_transactions'):
            self._transactions = self.source_transactions()
        return self._transactions
