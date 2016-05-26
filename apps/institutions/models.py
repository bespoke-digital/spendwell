
import logging
from base64 import b64decode

from django.core.files.base import ContentFile
from django.db import models
from django.conf import settings
from django.utils import timezone

from plaid import Client
from plaid.errors import ResourceNotFoundError, RequestFailedError

from apps.core.models import SWModel, SWManager
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.finicity.client import Finicity, FinicityError
from apps.finicity.models import FinicityInstitution


logger = logging.getLogger(__name__)


class InstitutionManager(SWManager):
    def from_plaid(self, owner, plaid_id, plaid_access_token, plaid_public_token, data, logo_data):
        institution, created = Institution.objects.get_or_create(
            owner=owner,
            plaid_id=plaid_id,
            defaults={'name': data['name']},
        )

        # Make sure reauth for FIs without plaid_public_token causes accounts
        # to be deleted. This can be removed later, since it only applies to
        # accounts connected before 2016/04/25
        if not created and not institution.plaid_public_token:
            institution.accounts.all().delete()

        institution.plaid_public_token = plaid_public_token
        institution.plaid_access_token = plaid_access_token

        if logo_data:
            institution.logo = ContentFile(b64decode(logo_data), 'logo.png')

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
    plaid_access_token = models.CharField(max_length=255, null=True, blank=True)
    plaid_public_token = models.CharField(max_length=255, null=True, blank=True)
    finicity_id = models.CharField(max_length=255, null=True, blank=True)
    reauth_required = models.BooleanField(default=False)
    last_sync = models.DateTimeField(null=True, blank=True)

    logo = models.ImageField(upload_to='institutions/institution/logo', blank=True, null=True)

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
    def finicity_institution(self):
        if not hasattr(self, '_finicity_institution'):
            if not self.finicity_id:
                self._finicity_institution = None

            else:
                try:
                    self._finicity_institution = FinicityInstitution.objects.get(
                        finicity_id=self.finicity_id
                    )
                except FinicityInstitution.DoesNotExist:
                    self._finicity_institution = None

        return self._finicity_institution

    @property
    def plaid_client(self):
        if not self.plaid_id or not self.plaid_access_token:
            return

        if not hasattr(self, '_plaid_client'):
            self._plaid_client = Client(
                client_id=settings.PLAID_CLIENT_ID,
                secret=settings.PLAID_SECRET,
                access_token=self.plaid_access_token,
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
            try:
                accounts_data = self.finicity_client.list_accounts(self.finicity_id)
            except FinicityError:
                self.reauth_required = True
                self.save()
                raise

            for account_data in accounts_data:
                Account.objects.from_finicity(self, account_data)

    def sync_transactions(self):
        if self.plaid_client and self.plaid_data:
            for transaction_data in self.plaid_data['transactions']:
                Transaction.objects.from_plaid(self, transaction_data)

        elif self.finicity_client:
            try:
                transactions_data = self.finicity_client.list_transactions(self.finicity_id)
            except FinicityError:
                self.reauth_required = True
                self.save()
                raise

            for transaction_data in transactions_data:
                Transaction.objects.from_finicity(self, transaction_data)

    def sync(self):
        self.sync_accounts()
        self.sync_transactions()
        self.last_sync = timezone.now()
        self.reauth_required = False
        self.save()
