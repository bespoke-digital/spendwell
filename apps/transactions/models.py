
from decimal import Decimal
from datetime import datetime

from dateutil.relativedelta import relativedelta
from delorean import Delorean

from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import get_current_timezone

from apps.core.models import SWModel, SWQuerySet, SWManager
from apps.categories.models import Category
from apps.accounts.models import Account

from .utils import similarity


class TransactionsQuerySet(SWQuerySet):
    def sum(self):
        return self.aggregate(models.Sum('amount'))['amount__sum'] or 0

    def is_transfer(self, has_transfer):
        queryset = self.annotate(models.Count('_transfer_pair'))
        if has_transfer:
            return queryset.filter(_transfer_pair__count__gt=0)
        else:
            return queryset.filter(_transfer_pair__count=0)


class TransactionManager(SWManager):
    queryset_class = TransactionsQuerySet

    def sum(self, *args, **kwargs):
        return self.get_queryset().sum(*args, **kwargs)

    def is_transfer(self, *args, **kwargs):
        return self.get_queryset().is_transfer(*args, **kwargs)

    def create_from_plaid(self, institution, json_data):
        account = Account.objects.get(
            institution=institution,
            plaid_id=json_data['_account'],
        )
        if account.disabled:
            return None

        try:
            transaction = Transaction.objects.get(plaid_id=json_data['_id'])
        except Transaction.DoesNotExist:
            transaction = Transaction()
            transaction.plaid_id = json_data['_id']

        transaction.account = account
        transaction.owner = institution.owner

        if json_data.get('category_id'):
            transaction.category = Category.objects.get(plaid_id=json_data['category_id'])

        transaction.description = json_data['name']
        transaction.amount = -Decimal(json_data['amount'])
        transaction.date = datetime(
            *map(int, json_data['date'].split('-')),
            tzinfo=get_current_timezone()
        )
        transaction.pending = json_data['pending']
        transaction.location = json_data['meta'].get('location', {})
        transaction.location['score'] = json_data.get('score')

        transaction.save()
        return transaction

    def detect_transfers(self, owner, month_start=None):
        transactions = self.filter(owner=owner, account__disabled=False)

        if month_start:
            transactions = transactions.filter(
                date__gte=month_start,
                date__lt=month_start + relativedelta(months=1),
            )

        for transaction in transactions:
            transactions.transfer_pair = None

        for transaction in transactions:
            if transaction.transfer_pair:
                continue

            potential_transfers = (
                Transaction.objects
                .exclude(account=transaction.account)
                .filter(owner=transaction.owner)
                .filter(account__disabled=False)
                .filter(amount=(-transaction.amount))
                .is_transfer(False)
            )

            if len(potential_transfers) == 0:
                continue
            elif len(potential_transfers) == 1:
                transfer = potential_transfers[0]
            else:
                # Fall back on similarity of description. This may miss many cases.
                # TODO: find a better algo for this.
                transfer = sorted(
                    potential_transfers,
                    key=lambda t: similarity(t.description, transaction.description),
                )[-1]

            transaction.transfer_pair = transfer
            transaction.save()


class Transaction(SWModel):
    owner = models.ForeignKey(
        'users.User',
        related_name='transactions',
        on_delete=models.CASCADE,
    )
    account = models.ForeignKey(
        'accounts.Account',
        related_name='transactions',
        on_delete=models.CASCADE,
    )
    category = models.ForeignKey(
        'categories.Category',
        related_name='transactions',
        null=True,
        on_delete=models.SET_NULL,
    )
    bucket_months = models.ManyToManyField(
        'buckets.BucketMonth',
        related_name='transactions',
        through='transactions.BucketTransaction',
    )
    _transfer_pair = models.ManyToManyField('self')

    description = models.CharField(max_length=255)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    date = models.DateTimeField()
    balance = models.DecimalField(decimal_places=2, max_digits=12, default=0)

    plaid_id = models.CharField(max_length=255, blank=True, null=True)
    from_savings = models.BooleanField(default=False)
    pending = models.BooleanField(default=False)
    location = JSONField(null=True)

    source = models.CharField(max_length=255, default='plaid', choices=(
        ('csv', 'CSV'),
        ('plaid', 'Plaid Connect'),
        ('demo', 'Demo Data'),
    ))

    objects = TransactionManager()

    class Meta:
        ordering = ('-date',)

    def __str__(self):
        return '{} - ${}'.format(self.description, self.amount)

    def mark_as_from_savings(self):
        if self.amount > 0:
            raise ValueError('only outgoing transactions can be "from savings".')

        self.bucket_months.clear()
        self.from_savings = True
        self.save()

    def assign_to_buckets(self):
        from apps.buckets.models import BucketMonth

        month_start = Delorean(datetime=self.date).truncate('month').datetime

        for bucket_month in BucketMonth.objects.filter(month_start=month_start):
            if self in bucket_month.bucket.transactions():
                BucketTransaction.objects.create(
                    bucket_month=bucket_month,
                    transaction=self,
                )

    def get_transfer_pair(self):
        try:
            return self._transfer_pair.all()[0]
        except IndexError:
            return None

    def set_transfer_pair(self, value):
        self._transfer_pair.clear()
        if value:
            return self._transfer_pair.add(value)

    transfer_pair = property(get_transfer_pair, set_transfer_pair)


@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, raw, **kwargs):
    if created and not raw:
        instance.assign_to_buckets()


class BucketTransaction(models.Model):
    bucket_month = models.ForeignKey('buckets.BucketMonth')
    transaction = models.ForeignKey('transactions.Transaction')
