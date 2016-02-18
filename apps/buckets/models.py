
from dateutil.relativedelta import relativedelta
import delorean

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel, SWManager
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    filters = JSONField(default=list)

    def __str__(self):
        return self.name

    def transactions(self, **filters):
        return apply_filter_list(
            Transaction.objects.filter(
                owner=self.owner,
                account__disabled=False,
                amount__lt=0,
                **filters
            ),
            self.filters,
            TransactionFilter,
        )


class BucketMonthManager(SWManager):
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
            self._avg_amount = self.bucket.transactions(
                date__gte=self.month_start - relativedelta(months=3),
                date__lt=self.month_start,
            ).sum() / 3

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


@receiver(post_save, sender=BucketMonth)
def transaction_post_save(sender, instance, created, raw, **kwargs):
    if created and not raw:
        instance.assign_transactions()
