
from decimal import Decimal
from copy import deepcopy

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel
from apps.core.utils import months_avg, this_month
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class BucketAvatar(models.Model):
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='buckets/bucketavatar/avatar')


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    _filters = JSONField(default=list, blank=True, null=True)
    type = models.CharField(max_length=10, default='expense', choices=(
        ('expense', 'Expense Category'),
        ('bill', 'Bill'),
        ('goal', 'Goal'),
        ('account', 'External Account'),
    ))
    fixed_goal_amount = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.name

    @property
    def filters(self):
        if not hasattr(self, '_high_filters'):
            if not self._filters:
                self._high_filters = None
                return self._high_filters

            else:
                self._high_filters = deepcopy(self._filters)
                for filter in self._high_filters:
                    for key, value in filter.items():
                        if isinstance(value, str) and value.startswith('decimal:'):
                            filter[key] = Decimal(value.split(':')[-1])

        return self._high_filters

    @filters.setter
    def filters(self, value):
        if value:
            low_filters = deepcopy(value)
            for index, filter in enumerate(low_filters):
                for key, value in filter.items():
                    if isinstance(value, Decimal):
                        filter[key] = 'decimal:{}'.format(value)
                low_filters[index] = filter

            self._filters = low_filters
        else:
            self._filters = None

        if hasattr(self, '_high_filters'):
            delattr(self, '_high_filters')

    @property
    def avatar(self):
        if not hasattr(self, '_avatar'):
            bucket_avatar = BucketAvatar.objects.filter(name__iexact=self.name).first()
            if bucket_avatar:
                self._avatar = bucket_avatar.avatar
            else:
                self._avatar = None

        return self._avatar

    @property
    def goal_amount(self):
        if not hasattr(self, '_goal_amount'):
            if self.fixed_goal_amount:
                self._goal_amount = self.fixed_goal_amount
            else:
                self._goal_amount = months_avg(self.transactions.all(), month_start=this_month())

        return self._goal_amount

    @property
    def is_fixed(self):
        if not hasattr(self, '_is_fixed'):
            self._is_fixed = bool(self.fixed_goal_amount)
        return self._is_fixed

    def raw_transactions(self, **filters):
        if self.filters is None:
            return []

        filters['owner'] = self.owner
        filters['account__disabled'] = False

        if self.type in ('expense', 'bill'):
            filters['amount__lt'] = 0

        return apply_filter_list(
            Transaction.objects.filter(**filters),
            self.filters,
            TransactionFilter,
        )

    def assign_transactions(self):
        BucketTransaction.objects.filter(bucket=self).delete()

        if self.filters is None:
            return

        for transaction_id in self.raw_transactions().values_list('id', flat=True):
            BucketTransaction.objects.get_or_create(bucket=self, transaction_id=transaction_id)


@receiver(post_save, sender=Bucket)
def bucket_post_save(sender, instance, created, raw, **kwargs):
    if not raw:
        instance.assign_transactions()
