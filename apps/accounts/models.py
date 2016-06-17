
from django.db import models

from apps.core.models import SWModel, SWManager


class AccountManager(SWManager):
    def from_plaid(self, institution, data):
        try:
            account = Account.objects.get(
                owner=institution.owner,
                institution=institution,
                plaid_id=data['_id'],
            )
        except Account.DoesNotExist:
            account = Account()
            account.owner = institution.owner
            account.institution = institution
            account.plaid_id = data['_id']

        account.type = data['type']
        account.subtype = data.get('subtype')
        account.name = data['meta']['name']
        account.number_snippet = data['meta']['number']

        if account.type == 'credit':
            account.current_balance = -(data['balance']['current'] or 0)
        else:
            account.current_balance = data['balance']['current']

        account.save()
        return account

    def from_finicity(self, institution, data):
        try:
            account = Account.objects.get(
                owner=institution.owner,
                institution=institution,
                finicity_id=data['id'],
            )
        except Account.DoesNotExist:
            account = Account()
            account.owner = institution.owner
            account.institution = institution
            account.finicity_id = data['id']

        account.type = data['type']
        account.name = data['name']
        account.number_snippet = data['number']
        account.current_balance = data.get('balance')

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

    def disable(self, detect_transfers=True):
        from apps.transactions.tasks import detect_transfers as detect_transfers_task

        self.disabled = True
        self.save()
        self.transactions.all().delete()

        if detect_transfers:
            detect_transfers_task.delay(self.owner.id)

    def enable(self, sync=True):
        self.disabled = False
        self.save()

        if sync:
            self.institution.sync()
