
import delorean
from dateutil.relativedelta import relativedelta

from apps.goals.models import GoalMonth
from apps.buckets.models import BucketMonth
from apps.transactions.models import Transaction


class MonthSummary(object):
    def __init__(self, user, month_start=None):
        self.user = user

        if month_start is None:
            self.month_start = delorean.now().truncate('month').datetime
        else:
            self.month_start = month_start

    def source_transactions(self, from_savings=False):
        return Transaction.objects.filter(
            owner=self.user,
            transfer_pair__isnull=True,
            account__disabled=False,
            from_savings=from_savings,
            date__lt=self.month_start + relativedelta(months=1),
            date__gte=self.month_start,
        )

    @property
    def income(self):
        if not hasattr(self, '_income'):
            self._income = self.source_transactions().filter(amount__gt=0).sum()

            if (
                relativedelta(self.month_start, delorean.now().datetime).months == 0 and
                self._income < self.user.estimated_income
            ):
                self._income = self.user.estimated_income
        return self._income

    @property
    def allocated(self):
        if not hasattr(self, '_allocated'):
            self._allocated = GoalMonth.objects.filter(
                goal__owner=self.user,
                month_start=self.month_start,
            ).sum('filled_amount')
        return self._allocated

    @property
    def spent(self):
        if not hasattr(self, '_spent'):
            self._spent = self.source_transactions().filter(amount__lt=0).sum()
        return self._spent

    @property
    def spent_from_savings(self):
        if not hasattr(self, '_spent_from_savings'):
            self._spent_from_savings = self.source_transactions(from_savings=True).sum()
        return self._spent_from_savings

    @property
    def net(self):
        if not hasattr(self, '_net'):
            self._net = sum([self.income, self.allocated, self.spent])
        return self._net

    @property
    def goal_months(self):
        if not hasattr(self, '_goal_months'):
            self._goal_months = GoalMonth.objects.filter(
                goal__owner=self.user,
                month_start=self.month_start,
            )
        return self._goal_months

    @property
    def bucket_months(self):
        if not hasattr(self, '_bucket_months'):
            self._bucket_months = BucketMonth.objects.filter(
                bucket__owner=self.user,
                month_start=self.month_start,
            )
        return self._bucket_months

    @property
    def transactions(self):
        if not hasattr(self, '_transactions'):
            self._transactions = self.source_transactions()
        print('self._transactions.count()', self._transactions.count())
        return self._transactions
