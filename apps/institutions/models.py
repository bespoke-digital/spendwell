
from django.db import models
from django.conf import settings
from django.utils import timezone

from plaid import Client

from apps.core.models import SWModel, SWManager
from apps.accounts.models import Account
from apps.transactions.models import Transaction


class InstitutionManager(SWManager):
    def create(self, **kwargs):
        institution = Institution(**kwargs)
        institution.save()
        # institution.sync()
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
    last_sync = models.DateTimeField(null=True)

    objects = InstitutionManager()

    class Meta:
        unique_together = ('plaid_id', 'owner')

    @classmethod
    def get_serializer_class(Cls):
        from .serializers import InstitutionSerializer
        return InstitutionSerializer

    def __str__(self):
        return '{} - {}'.format(self.name, self.owner)

    def sync(self):
        if not self.plaid_id or not self.access_token:
            raise RuntimeWarning('Attempt to sync an institution without plaid creds')

        plaid_client = Client(
            client_id=settings.PLAID_CLIENT_ID,
            secret=settings.PLAID_SECRET,
            access_token=self.access_token,
        )

        connect_response = plaid_client.connect_get().json()

        for account_data in connect_response['accounts']:
            Account.objects.create_from_plaid(self, account_data)

        for transaction_data in connect_response['transactions']:
            Transaction.objects.create_from_plaid(self, transaction_data)

        self.last_sync = timezone.now()
        self.save()
