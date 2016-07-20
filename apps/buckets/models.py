
from decimal import Decimal
from copy import deepcopy
from dateutil.relativedelta import relativedelta

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.fields import JSONField
import delorean

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
            self._high_filters = deepcopy(self._filters)
            for filter in self._high_filters:
                for key, value in filter.items():
                    if isinstance(value, str) and value.startswith('decimal:'):
                        filter[key] = Decimal(value.split(':')[-1])
        return self._high_filters

    @filters.setter
    def filters(self, value):
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

    @property
    def avatar(self):
        if not hasattr(self, '_avatar'):
            bucket_avatar = BucketAvatar.objects.filter(name__iexact=self.name).first()
            if bucket_avatar:
                self._avatar = bucket_avatar.avatar
            else:
                self._avatar = None

        return self._avatar

    def avg_amount(self, month=None):
        if not month:
            month = this_month()

        return months_avg(self.transactions.all(), month_start=month)

    def bill_due_date(self):
        if not self.type == 'bill':
            raise ValueError('bill_due_date called for non-bill bucket')

        if hasattr(self, '_bill_due_date'):
            return self._bill_due_date

        dates = []

        for months_ago in range(1, 4):
            month_start = this_month() - relativedelta(months=months_ago)
            month_end = month_start + relativedelta(months=1)

            transaction = self.transactions.filter(date__gt=month_start, date__lt=month_end).first()

            if not transaction:
                return None

            dates.append(transaction.date.day)

        date_range = max(dates) - min(dates)

        if date_range > 4:
            return None

        self._bill_due_date = this_month().replace(day=max(dates) - int(date_range / 2))

        return self._bill_due_date

    def bill_paid(self, month=None):
        if not self.type == 'bill':
            raise ValueError('bill_paid called for non-bill bucket')

        if not month:
            month = this_month()

        paid_amount = self.transactions.filter(
            date__gt=month,
            date__lt=month + relativedelta(months=1),
        ).sum()

        return paid_amount <= (self.avg_amount(month) * Decimal('0.95'))

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
