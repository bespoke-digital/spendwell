
from decimal import Decimal
from copy import deepcopy

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel
from apps.transactions.models import Transaction, BucketTransaction
from apps.transactions.filters import TransactionFilter
from apps.transactions.utils import apply_filter_list


class BucketAvatar(models.Model):
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='buckets/bucketavatar/avatar')


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    _filters = JSONField(default=list)
    type = models.CharField(max_length=10, default='expense', choices=(
        ('expense', 'Expense Category'),
        ('bill', 'Bill'),
        ('account', 'External Account'),
    ))

    def __str__(self):
        return self.name

    @property
    def filters(self):
        if not hasattr(self, '_high_filters'):
            self._high_filters = self._filters
            for filter in self._high_filters:
                for key, value in filter.items():
                    if isinstance(value, str) and value.startswith('decimal:'):
                        filter[key] = Decimal(value.split(':')[-1])
        return self._high_filters

    @filters.setter
    def filters(self, value):
        # import pdb; pdb.set_trace()
        low_filters = deepcopy(value)
        for index, filter in enumerate(low_filters):
            for key, value in filter.items():
                if isinstance(value, Decimal):
                    filter[key] = 'decimal:{}'.format(value)
            low_filters[index] = filter

        self._filters = low_filters

        # Delete and cached filter value
        if hasattr(self, '_high_filters'):
            delattr(self, '_high_filters')
            self.filters

    @property
    def avatar(self):
        if not hasattr(self, '_avatar'):
            try:
                self._avatar = BucketAvatar.objects.get(name__iexact=self.name).avatar
            except BucketAvatar.DoesNotExist:
                self._avatar = None
        return self._avatar

    def raw_transactions(self, **filters):
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
        for transaction_id in self.raw_transactions().values_list('id', flat=True):
            BucketTransaction.objects.get_or_create(bucket=self, transaction_id=transaction_id)


@receiver(post_save, sender=Bucket)
def bucket_post_save(sender, instance, created, raw, **kwargs):
    if not raw:
        instance.assign_transactions()
