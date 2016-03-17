
from dateutil.relativedelta import relativedelta

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel, SWManager, SWQuerySet
from apps.core.utils import this_month, months_avg, months_ago
from apps.core.signals import month_start
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    filters = JSONField(default=list)
    type = models.CharField(max_length=10, default='expense', choices=(
        ('expense', 'Expense Category'),
        ('bill', 'Bill'),
        ('account', 'External Account'),
    ))

    def __str__(self):
        return self.name

    def transactions(self, **filters):
        filters['owner'] = self.owner
        filters['account__disabled'] = False

        if self.type in ('expense', 'bill'):
            filters['amount__lt'] = 0

        return apply_filter_list(
            Transaction.objects.filter(**filters),
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
        month_start = this_month()
        BucketMonth.objects.create(bucket=instance, month_start=month_start)

        if months_ago(instance.owner.created) == 0:
            for i in range(months_ago(instance.owner.first_data_month())):
                BucketMonth.objects.create(
                    bucket=instance,
                    month_start=month_start - relativedelta(months=i + 1),
                )

    elif not raw:
        BucketTransaction.objects.filter(bucket_month__bucket=instance).delete()
        for month in instance.months.all():
            month.assign_transactions()


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
        ordering = ('-month_start',)

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
