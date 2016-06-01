
from decimal import Decimal
from datetime import datetime
from pytz import timezone
import logging

from django.contrib.postgres.fields import JSONField
from django.db import models

from apps.core.models import SWModel, SWQuerySet, SWManager
from apps.accounts.models import Account
from apps.finicity.utils import normalize_transaction_description

from .utils import similarity


logger = logging.getLogger(__name__)


class TransactionsQuerySet(SWQuerySet):
    def sum(self):
        return self.aggregate(models.Sum('amount'))['amount__sum'] or 0

    def is_transfer(self, has_transfer):
        queryset = self.annotate(models.Count('_transfer_pair'))

        if has_transfer:
            method = 'filter'
        else:
            method = 'exclude'

        return getattr(queryset, method)(
            models.Q(_transfer_pair__count__gt=0) |
            models.Q(buckets__type='account')
        )


class TransactionManager(SWManager):
    queryset_class = TransactionsQuerySet

    def sum(self, *args, **kwargs):
        return self.get_queryset().sum(*args, **kwargs)

    def is_transfer(self, *args, **kwargs):
        return self.get_queryset().is_transfer(*args, **kwargs)

    def from_plaid(self, institution, data):
        account = Account.objects.get(
            institution=institution,
            plaid_id=data['_account'],
        )
        if account.disabled:
            return None

        try:
            transaction = Transaction.objects.get(plaid_id=data['_id'])
        except Transaction.DoesNotExist:
            transaction = Transaction()
            transaction.plaid_id = data['_id']

        transaction.account = account
        transaction.owner = institution.owner

        transaction.description = data['name']
        transaction.amount = -Decimal(data['amount'])
        transaction.date = datetime(
            *map(int, data['date'].split('-')),
            tzinfo=timezone(institution.owner.timezone)
        )
        transaction.pending = data['pending']
        transaction.location = data['meta'].get('location', {})
        transaction.location['score'] = data.get('score')

        transaction.source = 'plaid'

        transaction.save()

        return transaction

    def from_finicity(self, institution, data):
        try:
            account = Account.objects.get(
                institution=institution,
                finicity_id=data['accountId'],
            )
        except Account.DoesNotExist:
            logger.warn('Account with Finicity ID {} for institution {} does not exits.'.format(
                data['accountId'],
                institution.id,
            ))
            return None

        if account.disabled:
            return None

        try:
            transaction = Transaction.objects.get(finicity_id=data['id'])
        except Transaction.DoesNotExist:
            transaction = Transaction()
            transaction.finicity_id = data['id']

        transaction.account = account
        transaction.owner = institution.owner

        transaction.description = normalize_transaction_description(data['description'])
        transaction.amount = Decimal(data['amount'])
        transaction.date = datetime.fromtimestamp(
            float(data['postedDate']),
            timezone(institution.owner.timezone),
        )

        transaction.source = 'finicity'

        transaction.save()
        return transaction

    def detect_transfers(self, owner):
        transactions = self.filter(owner=owner, account__disabled=False)

        for transaction in transactions:
            transaction.transfer_pair = None

        for transaction in transactions:
            if transaction.transfer_pair:
                continue

            potential_transfers = [txn for txn in transactions if (
                txn.account != transaction.account and
                txn.amount == -transaction.amount and
                txn.transfer_pair is None
            )]

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
    buckets = models.ManyToManyField(
        'buckets.Bucket',
        related_name='transactions',
        through='transactions.BucketTransaction',
    )
    _transfer_pair = models.ManyToManyField('self')

    description = models.CharField(max_length=255, db_index=True)
    amount = models.DecimalField(decimal_places=2, max_digits=12, db_index=True)
    date = models.DateTimeField(db_index=True)
    balance = models.DecimalField(decimal_places=2, max_digits=12, default=0)

    plaid_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    finicity_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    from_savings = models.BooleanField(default=False)
    pending = models.BooleanField(default=False)
    location = JSONField(null=True)

    source = models.CharField(max_length=255, choices=(
        ('csv', 'CSV'),
        ('plaid', 'Plaid'),
        ('finicity', 'Finicity'),
        ('demo', 'Demo Data'),
    ))

    objects = TransactionManager()

    class Meta:
        ordering = ('-date',)

    def __str__(self):
        return self.description

    def toggle_from_savings(self):
        if self.amount > 0:
            raise ValueError('only outgoing transactions can be "from savings".')

        self.buckets.clear()
        self.from_savings = not self.from_savings
        self.save()

        if not self.from_savings:
            self.assign_to_buckets()

    def assign_to_buckets(self):
        from apps.buckets.models import Bucket

        if self.transfer_pair:
            return

        for bucket in Bucket.objects.filter(owner=self.owner):
            if self in bucket.transactions():
                BucketTransaction.objects.get_or_create(bucket=bucket, transaction=self)

    @property
    def transfer_pair(self):
        return self._transfer_pair.first()

    @transfer_pair.setter
    def transfer_pair(self, value):
        self._transfer_pair.clear()
        if value:
            return self._transfer_pair.add(value)


class BucketTransaction(models.Model):
    bucket = models.ForeignKey('buckets.Bucket')
    transaction = models.ForeignKey('transactions.Transaction')

    class Meta:
        unique_together = ('bucket', 'transaction')


class IncomeFromSavings(SWModel):
    owner = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='income_from_savings',
    )
    month_start = models.DateTimeField(unique=True)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
