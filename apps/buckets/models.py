
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel
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
        for transaction in self.raw_transactions():
            BucketTransaction.objects.get_or_create(bucket=self, transaction=transaction)


@receiver(post_save, sender=Bucket)
def bucket_post_save(sender, instance, created, raw, **kwargs):
    if not raw:
        instance.assign_transactions()
