
from django.db import models
from django.contrib.postgres.fields import JSONField
from dateutil.relativedelta import relativedelta

from apps.core.models import SWModel, SWManager
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter


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

    def filtered_transactions(self, **global_filters):
        global_filters['owner'] = self.owner

        if len(self.filters) == 0:
            return Transaction.objects.filter(**global_filters)

        queryset = TransactionFilter(self.filters[0]).qs.filter(**global_filters)
        for filter in self.filters[1:]:
            queryset = queryset | TransactionFilter(filter).qs.filter(**global_filters)

        return queryset


class BucketMonthManager(SWManager):
    def generate(self, bucket, month_start):
        return self.model.objects.create(bucket=bucket, month_start=month_start)

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

    def assign_transactions(self):
        for transaction_id in self.bucket.filtered_transactions(
            date__gte=self.month_start,
            date__lt=self.month_start + relativedelta(months=1),
        ).values_list('id', flat=True):
            BucketTransaction.objects.create(
                bucket_month=self,
                transaction_id=transaction_id,
            )
