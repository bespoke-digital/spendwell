
import logging
from base64 import b64decode

from django.core.files.base import ContentFile
from django.db import models
from django.conf import settings
from django.utils import timezone
from plaid import Client
from plaid.errors import ResourceNotFoundError, RequestFailedError
from mixpanel import Mixpanel

from apps.core.models import SWModel, SWManager
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.finicity.client import Finicity, FinicityError


logger = logging.getLogger(__name__)
mixpanel = Mixpanel(settings.MIXPANEL_PUBLIC_KEY)


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
        try:
            logo = InstitutionTemplate.objects.get(finicity_id=data['id']).image
        except InstitutionTemplate.DoesNotExist:
            logo = None

        institution, created = Institution.objects.get_or_create(
            owner=owner,
            finicity_id=data['id'],
            defaults={'name': data['name'], 'logo': logo},
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

    def __str__(self):
        return self.name

    @property
    def institution_template(self):
        if not hasattr(self, '_institution_template'):
            if not self.finicity_id:
                self._institution_template = None

            else:
                try:
                    self._institution_template = InstitutionTemplate.objects.get(
                        finicity_id=self.finicity_id
                    )
                except InstitutionTemplate.DoesNotExist:
                    self._institution_template = None

        return self._institution_template

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

        if self.finicity_id:
            provider = 'finicty'
        elif self.finicity_id:
            provider = 'plaid'
        else:
            provider = 'other'

        mixpanel.track(self.owner.id, 'sync', {
            'provider': provider,
            'accounts': self.accounts.count(),
            'transactions': sum([a.transactions.count() for a in self.accounts.all()]),
        })


class InstitutionTemplate(models.Model):
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    finicity_id = models.CharField(max_length=255, blank=True, null=True)
    plaid_id = models.CharField(max_length=255, blank=True, null=True)
    color = models.CharField(max_length=21, default='#000000')
    image = models.ImageField(
        upload_to='finicity/institutions',
        null=True, blank=True,
    )
    default = models.CharField(max_length=20, blank=True, default='', choices=(
        ('', 'Search Only'),
        ('us', 'USA'),
        ('ca', 'Canada'),
    ))
