
from dateutil.relativedelta import relativedelta

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel, SWManager, SWQuerySet
from apps.core.utils import this_month, months_avg
from apps.core.signals import month_start
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    filters = JSONField(default=list)
    type = models.CharField(max_length=10, default='expense', choices=(
        ('expense', 'Expense'),
        ('bill', 'Bill'),
    ))

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

    def generate_month(self, month_start=None):
        if month_start is None:
            month_start = this_month()
        bucket_month, created = BucketMonth.objects.get_or_create(
            bucket=self,
            month_start=month_start,
        )
        return bucket_month


@receiver(post_save, sender=Bucket)
def bucket_post_save(sender, instance, created, raw, **kwargs):
    if created and not raw:
        BucketMonth.objects.create(bucket=instance, month_start=this_month())


class BucketMonthQueryset(SWQuerySet):
    def owned_by(self, user):
        return self.filter(bucket__owner=user)


class BucketMonthManager(SWManager):
    queryset_class = BucketMonthQueryset

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
            self._avg_amount = months_avg(
                self.bucket.transactions(),
                month_start=self.month_start,
            )
            # furthest_back = self.bucket.transactions().order_by('date').values_list('date', flat=True)[1]
            # months_ago = relativedelta(self.month_start, furthest_back).months

            # if months_ago >= 2:
            #     months_ago = 3
            # elif months_ago == 1:
            #     months_ago = 2
            # else:
            #     months_ago = 1

            # self._avg_amount = Decimal(self.bucket.transactions(
            #     date__gte=self.month_start - relativedelta(months=months_ago),
            #     date__lt=self.month_start,
            # ).sum()) / Decimal(months_ago)

        return self._avg_amount

    @property
    def owner(self):
        return self.bucket.owner

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
def bucket_month_post_save(sender, instance, created, raw, **kwargs):
    if created and not raw:
        instance.assign_transactions()


@receiver(month_start)
def on_month_start(sender, month, **kwargs):
    for bucket in Bucket.objects.all():
        bucket.generate_month(month_start=month)
