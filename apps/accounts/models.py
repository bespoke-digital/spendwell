
from decimal import Decimal

from django.db import models

from apps.core.models import SWModel, SWManager


class AccountManager(SWManager):
    def from_plaid(self, institution, json_data):
        try:
            account = Account.objects.get(
                owner=institution.owner,
                institution=institution,
                plaid_id=json_data['_id'],
            )
        except Account.DoesNotExist:
            account = Account()
            account.owner = institution.owner
            account.institution = institution
            account.plaid_id = json_data['_id']

        account.type = json_data['type']
        account.subtype = json_data.get('subtype')
        account.name = json_data['meta']['name']
        account.number_snippet = json_data['meta']['number']

        if account.type == 'credit':
            account.current_balance = -(json_data['balance']['current'] or 0)
        else:
            account.current_balance = json_data['balance']['current']

        account.save()
        return account

    def from_finicity(self, institution, json_data):
        try:
            account = Account.objects.get(
                owner=institution.owner,
                institution=institution,
                finicity_id=json_data['id'],
            )
        except Account.DoesNotExist:
            account = Account()
            account.owner = institution.owner
            account.institution = institution
            account.finicity_id = json_data['id']

        account.type = json_data['type']
        account.name = json_data['name']
        account.number_snippet = json_data['number']
        account.current_balance = Decimal(json_data['balance'])
        account.disabled = True

        account.save()
        return account


class Account(SWModel):
    owner = models.ForeignKey(
        'users.User',
        related_name='accounts',
        on_delete=models.CASCADE,
    )
    institution = models.ForeignKey(
        'institutions.Institution',
        related_name='accounts',
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255, default='chequing')
    subtype = models.CharField(max_length=255, null=True)
    current_balance = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        null=True, blank=True,
    )
    available_balance = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        null=True, blank=True,
    )
    number_snippet = models.CharField(max_length=255, blank=True, null=True)
    plaid_id = models.CharField(max_length=255, blank=True, null=True)
    finicity_id = models.CharField(max_length=255, blank=True, null=True)
    disabled = models.BooleanField(default=False, db_index=True)

    objects = AccountManager()

    def __str__(self):
        if self.subtype:
            return '{} - {} > {}'.format(self.name, self.type, self.subtype)
        else:
            return '{} - {}'.format(self.name, self.type)

    def disable(self):
        from apps.transactions.models import Transaction

        self.disabled = True
        self.save()
        self.transactions.all().delete()
        Transaction.objects.detect_transfers(owner=self.owner)

    def enable(self):
        self.disabled = False
        self.save()

        self.institution.sync()
