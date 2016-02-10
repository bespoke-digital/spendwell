
from django.db import models

from apps.core.models import SWModel, SWManager


class AccountManager(SWManager):
    def create_from_plaid(self, institution, json_data):
        try:
            account = Account.objects.get(plaid_id=json_data['_id'])
        except Account.DoesNotExist:
            account = Account()
            account.plaid_id = json_data['_id']

        account.institution = institution
        account.owner = institution.owner

        account.type = json_data['type']
        account.subtype = json_data.get('subtype')
        account.name = json_data['meta']['name']
        account.number_snippet = json_data['meta']['number']
        account.balance_current = json_data['balance']['current']
        account.balance_available = json_data['balance']['available']

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
    disabled = models.BooleanField(default=False, db_index=True)

    objects = AccountManager()

    def __str__(self):
        if self.subtype:
            return '{} - {} > {}'.format(self.name, self.type, self.subtype)
        else:
            return '{} - {}'.format(self.name, self.type)
