
from decimal import Decimal
from datetime import datetime
from dateutil.relativedelta import relativedelta

from django.contrib.postgres.fields import JSONField
from django.db import models

from apps.core.models import SWModel, SWQuerySet, SWManager
from apps.categories.models import Category
from apps.accounts.models import Account

from .utils import similarity


class TransactionsQuerySet(SWQuerySet):
    def sum(self):
        return self.aggregate(models.Sum('amount'))['amount__sum'] or 0


class TransactionManager(SWManager):
    queryset_class = TransactionsQuerySet

    def sum(self):
        return self.get_queryset().sum()

    def create_from_plaid(self, institution, json_data):
        try:
            transaction = Transaction.objects.get(plaid_id=json_data['_id'])
        except Transaction.DoesNotExist:
            transaction = Transaction()
            transaction.plaid_id = json_data['_id']

        transaction.account = Account.objects.get(plaid_id=json_data['_account'])
        transaction.owner = institution.owner

        if json_data.get('category_id'):
            transaction.category = Category.objects.get(plaid_id=json_data['category_id'])

        transaction.description = json_data['name']
        transaction.amount = -Decimal(json_data['amount'])
        transaction.date = datetime(*map(int, json_data['date'].split('-')))
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

        transactions.update(transfer_pair=None)

        for transaction in transactions:
            potential_transfers = Transaction.objects.exclude(
                account=transaction.account,
            ).filter(
                owner=transaction.owner,
                transfer_pair__isnull=True,
                account__disabled=False,
                amount=(-transaction.amount),
                # date__lte=transaction.date + timedelta(days=3),
                # date__gte=transaction.date - timedelta(days=3),
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

            transfer.transfer_pair = transaction
            transfer.save()

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
    transfer_pair = models.ForeignKey(
        'self',
        null=True,
        on_delete=models.SET_NULL,
    )
    bucket_months = models.ManyToManyField(
        'buckets.BucketMonth',
        related_name='transactions',
        through='transactions.BucketTransaction',
    )

    description = models.CharField(max_length=255)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    date = models.DateTimeField()
    balance = models.DecimalField(decimal_places=2, max_digits=12, default=0)

    plaid_id = models.CharField(max_length=255, blank=True, null=True)
    savings = models.BooleanField(default=False)
    pending = models.BooleanField(default=False)
    location = JSONField(null=True)

    source = models.CharField(max_length=255, default='plaid', choices=(
        ('csv', 'CSV'),
        ('plaid', 'Plaid Connect'),
    ))

    objects = TransactionManager()

    class Meta:
        ordering = ('-date',)

    def __str__(self):
        return '{} - ${}'.format(self.description, self.amount)

    def mark_as_savings(self):
        self.bucket_months.clear()
        self.savings = True
        self.save()


class BucketTransaction(models.Model):
    bucket_month = models.ForeignKey('buckets.BucketMonth')
    transaction = models.ForeignKey('transactions.Transaction')
