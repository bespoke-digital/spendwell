
import logging
from time import time

from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.utils import timezone

from plaid import Client
from plaid.errors import ResourceNotFoundError, RequestFailedError

from apps.core.models import SWModel, SWManager
from apps.core.signals import day_start
from apps.accounts.models import Account
from apps.buckets.models import Bucket
from apps.transactions.models import Transaction
from apps.finicity.client import Finicity


logger = logging.getLogger(__name__)


def log_time(prev_time, *args):
    cur_time = time()
    print(cur_time - prev_time, '\t', *args)
    return cur_time


class InstitutionManager(SWManager):
    def from_plaid(self, owner, plaid_id, access_token, data):
        institution, created = Institution.objects.get_or_create(
            owner=owner,
            plaid_id=plaid_id,
            defaults={'name': data['name']},
        )
        institution.access_token = access_token
        institution.save()
        return institution

    def from_finicity(self, owner, data):
        institution, created = Institution.objects.get_or_create(
            owner=owner,
            finicity_id=data['id'],
            defaults={'name': data['name']},
        )
        return institution


class Institution(SWModel):
    owner = models.ForeignKey(
        'users.User',
        related_name='institutions',
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)
    plaid_id = models.CharField(max_length=255, null=True, blank=True)
    access_token = models.CharField(max_length=255, null=True, blank=True)
    finicity_id = models.CharField(max_length=255, null=True, blank=True)
    reauth_required = models.BooleanField(default=False)
    last_sync = models.DateTimeField(null=True)

    objects = InstitutionManager()

    class Meta:
        unique_together = ('plaid_id', 'owner')

    @classmethod
    def get_serializer_class(Cls):
        from .serializers import InstitutionSerializer
        return InstitutionSerializer

    def __str__(self):
        return self.name

    @property
    def plaid_client(self):
        if not self.plaid_id or not self.access_token:
            return

        if not hasattr(self, '_plaid_client'):
            self._plaid_client = Client(
                client_id=settings.PLAID_CLIENT_ID,
                secret=settings.PLAID_SECRET,
                access_token=self.access_token,
            )
        return self._plaid_client

    @property
    def plaid_data(self):
        if not hasattr(self, '_plaid_data'):
            try:
                self._plaid_data = self.plaid_client.connect_get().json()

            except ResourceNotFoundError:
                self._plaid_data = None

            except RequestFailedError:
                self._plaid_data = None
                self.reauth_required = True
                self.save()

        return self._plaid_data

    @property
    def finicity_client(self):
        if not self.finicity_id:
            return

        if not hasattr(self, '_finicity_client'):
            self._finicity_client = Finicity(user=self.owner)
        return self._finicity_client

    @property
    def current_balance(self):
        return (
            self.accounts
            .filter(disabled=False)
            .aggregate(models.Sum('current_balance'))
            ['current_balance__sum']
        ) or 0

    def sync_accounts(self):
        if self.plaid_client and self.plaid_data:
            for account_data in self.plaid_data['accounts']:
                Account.objects.from_plaid(self, account_data)

        elif self.finicity_client:
            accounts_data = self.finicity_client.list_accounts(self.finicity_id)
            for account_data in accounts_data:
                Account.objects.from_finicity(self, account_data)

    def sync_transactions(self, tm):
        txn_times = []
        if self.plaid_client and self.plaid_data:
            tm = log_time(tm, 'data fetched')
            txn_prev = time()
            for transaction_data in self.plaid_data['transactions']:
                Transaction.objects.from_plaid(self, transaction_data)

                txn_cur = time()
                txn_times.append(txn_cur - txn_prev)
                txn_prev = txn_cur

        elif self.finicity_client:
            transactions_data = self.finicity_client.list_transactions(self.finicity_id)
            tm = log_time(tm, 'data fetched')
            txn_prev = time()
            for transaction_data in transactions_data:
                Transaction.objects.from_finicity(self, transaction_data)

                txn_cur = time()
                txn_times.append(txn_cur - txn_prev)
                txn_prev = txn_cur

        print(sum(txn_times) / len(txn_times), '\t', 'avg txn time')
        print(len(txn_times), '\t', 'x txns')

        tm = log_time(tm, 'transactions synced')

        Transaction.objects.detect_transfers(owner=self.owner)

        tm = log_time(tm, 'detect_transfers')

        for bucket in Bucket.objects.filter(owner=self.owner):
            bucket.assign_transactions()

        tm = log_time(tm, 'bucket.assign_transactions')

        return tm

    def sync(self):
        tm = time()
        print('\n', self.name)

        self.sync_accounts()
        tm = log_time(tm, 'sync_accounts')
        tm = self.sync_transactions(tm)
        tm = log_time(tm, 'sync_transactions')
        self.last_sync = timezone.now()
        self.save()


@receiver(day_start)
def on_day_start(*args, **kwargs):
    for institution in Institution.objects.filter(
        access_token__isnull=False,
        plaid_id__isnull=False,
    ):
        try:
            institution.sync()
        except:
            # Don't fail on exceptions so one bad FI doesn't kill an entire sync
            logger.exception(
                'Exception occurred while syncing plaid institution {}'.format(institution.id)
            )

    for institution in Institution.objects.filter(finicity_id__isnull=False):
        try:
            institution.sync()
        except:
            # Don't fail on exceptions so one bad FI doesn't kill an entire sync
            logger.exception(
                'Exception occurred while syncing finicity institution {}'.format(institution.id)
            )
