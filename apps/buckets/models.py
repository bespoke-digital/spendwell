
from django.db import models
from django.contrib.postgres.fields import JSONField
from dateutil.relativedelta import relativedelta
import delorean

from apps.core.models import SWModel, SWManager
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class BucketManager(SWManager):
    def assign_transactions(self, *args, **kwargs):
        return self.get_queryset().assign(*args, **kwargs)


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    filters = JSONField(default=list)

    objects = BucketManager()

    def __str__(self):
        return self.name

    def transactions(self, **filters):
        return apply_filter_list(
            Transaction.objects.filter(owner=self.owner, **filters),
            self.filters,
            TransactionFilter,
        )


class BucketMonthManager(SWManager):
    def generate(self, bucket, month_start=None):
        if month_start is None:
            month_start = delorean.now().truncate('month').datetime
        bucket_month = self.model.objects.create(bucket=bucket, month_start=month_start)
        bucket_month.assign_transactions()
        return bucket_month

    def assign_transactions(self, owner, month_start):
        BucketTransaction.objects.filter(
            transaction__owner=owner,
            bucket_month__month_start=month_start,
        ).delete()

        for bucket_month in self.filter(bucket__owner=owner, month_start=month_start):
            bucket_month.assign_transactions()


class BucketMonth(SWModel):
    bucket = models.ForeignKey(Bucket, related_name='months')
    month_start = models.DateTimeField()

    objects = BucketMonthManager()

    class Meta:
        unique_together = ('bucket', 'month_start')

    @property
    def amount(self):
        if not hasattr(self, '_amount'):
            self._amount = self.transactions.sum()
        return self._amount

    @property
    def avg_amount(self):
        if not hasattr(self, '_avg_amount'):
            amounts = [
                bucket_month.amount
                for bucket_month in BucketMonth.objects.filter(month_start__in=[
                    self.month_start - relativedelta(months=i)
                    for i in range(1, 4)
                ])
            ]
            if len(amounts) == 0:
                self._avg_amount = None
            else:
                self._avg_amount = sum(amounts) / len(amounts)

        return self._avg_amount

    def assign_transactions(self):
        for transaction_id in self.bucket.transactions(
            date__gte=self.month_start,
            date__lt=self.month_start + relativedelta(months=1),
        ).values_list('id', flat=True):
            BucketTransaction.objects.create(
                bucket_month=self,
                transaction_id=transaction_id,
            )
