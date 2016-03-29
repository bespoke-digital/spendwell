
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.utils import timezone

from plaid import Client
from plaid.errors import ResourceNotFoundError

from apps.core.models import SWModel
from apps.core.signals import day_start
from apps.accounts.models import Account
from apps.buckets.models import BucketMonth
from apps.transactions.models import Transaction


class Institution(SWModel):
    owner = models.ForeignKey(
        'users.User',
        related_name='institutions',
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)
    plaid_id = models.CharField(max_length=255, null=True, blank=True)
    access_token = models.CharField(max_length=255, null=True, blank=True)
    last_sync = models.DateTimeField(null=True)

    class Meta:
        unique_together = ('plaid_id', 'owner')

    @classmethod
    def get_serializer_class(Cls):
        from .serializers import InstitutionSerializer
        return InstitutionSerializer

    def __str__(self):
        return '{} - {}'.format(self.name, self.owner)

    @property
    def plaid_client(self):
        if not self.plaid_id or not self.access_token:
            raise RuntimeWarning('Attempt to sync an institution without plaid creds')

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
        return self._plaid_data

    @property
    def current_balance(self):
        return (
            self.accounts
            .filter(disabled=False)
            .aggregate(models.Sum('current_balance'))
            ['current_balance__sum']
        ) or 0

    def sync_accounts(self):
        if not self.plaid_data:
            return

        for account_data in self.plaid_data['accounts']:
            Account.objects.from_plaid(self, account_data)

    def sync(self):
        if not self.plaid_data:
            return

        self.sync_accounts()

        for transaction_data in self.plaid_data['transactions']:
            Transaction.objects.from_plaid(self, transaction_data)

        Transaction.objects.detect_transfers(owner=self.owner)

        for bucket_month in BucketMonth.objects.filter(bucket__owner=self.owner):
            bucket_month.assign_transactions()

        self.last_sync = timezone.now()
        self.save()


@receiver(day_start)
def on_day_start(*args, **kwargs):
    for institution in Institution.objects.filter(
        access_token__isnull=False,
        plaid_id__isnull=False,
    ):
        institution.sync()
