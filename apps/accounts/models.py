
from django.utils.timezone import now
from django.db import models

from apps.core.models import SWOwnedModel


class AccountManager(models.Manager):
    def create_from_plaid(self, institution, json_data):
        '''
        Sample Data:
        {
          '_id':'nban4wnPKEtnmEpaKzbYFYQvA7D7pnCaeDBMy',
          '_user':'eJXpMzpR65FP4RYno6rzuA7OZjd9n3Hna0RYa',
          '_item':'KdDjmojBERUKx3JkDd9RuxA5EvejA4SENO4AA',
          'institution_type':'fake_institution',
          'type':'depository',
          'subtype':'checking',
          'meta':{
            'name':'Plaid Checking',
            'number':'1702'
          },
          'balance':{
            'current':1253.32,
            'available':1081.78
          }
        }
        '''
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
        account.last_updated = now()

        account.save()
        return account


class Account(SWOwnedModel):
    institution = models.ForeignKey('institutions.Institution', related_name='accounts')
    plaid_id = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    subtype = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255)
    number_snippet = models.CharField(max_length=255)
    balance_current = models.DecimalField(decimal_places=2, max_digits=12)
    balance_available = models.DecimalField(decimal_places=2, max_digits=12)
    last_updated = models.DateTimeField()

    objects = AccountManager()

    def __str__(self):
        if self.subtype:
            return '{} - {} > {}'.format(self.name, self.type, self.subtype)
        else:
            return '{} - {}'.format(self.name, self.type)
