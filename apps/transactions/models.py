
from decimal import Decimal
from datetime import datetime

from django.db import models

from apps.core.models import SWOwnedModel
from apps.categories.models import Category
from apps.accounts.models import Account


class TransactionManager(models.Manager):
    def create_from_plaid(self, institution, json_data):
        '''
        Sample Data:
        {
          '_account':'nban4wnPKEtnmEpaKzbYFYQvA7D7pnCaeDBMy',
          '_id':'DAE3Yo3wXgskjXV1JqBDIrDBVvjMLDCQ4rMQdR'
          'name':'Gregorys Coffee',
          'category':[
            'Food and Drink',
            'Restaurants',
            'Coffee Shop'
          ],
          'pending':False,
          'amount':3.19,
          'date':'2014-06-21',
          'meta':{
            'location':{
              'city':'New York',
              'address':'874 Avenue of the Americas',
              'state':'NY'
            }
          },
          'type':{
            'primary':'place'
          },
          'category_id':'13005043',
          'score':{
            'name':0.2,
            'location':{
              'city':1,
              'address':1,
              'state':1
            }
          },
        }
        '''
        try:
            transaction = Transaction.objects.get(plaid_id=json_data['_id'])
        except Transaction.DoesNotExist:
            transaction = Transaction()
            transaction.plaid_id = json_data['_id']

        transaction.account = Account.objects.get(plaid_id=json_data['_account'])
        transaction.owner = institution.owner

        if json_data.get('category_id'):
            transaction.category = Category.objects.get(plaid_id=json_data['category_id'])

        transaction.name = json_data['name']
        transaction.amount = Decimal(json_data['amount'])
        transaction.date = datetime(*map(int, json_data['date'].split('-')))

        if json_data['meta'].get('location'):
            transaction.address_city = json_data['meta']['location'].get('city')
            transaction.address_street = json_data['meta']['location'].get('street')
            transaction.address_state = json_data['meta']['location'].get('state')

        transaction.save()
        return transaction


class Transaction(SWOwnedModel):
    account = models.ForeignKey('accounts.Account', related_name='transactions')
    category = models.ForeignKey('categories.Category', related_name='transactions', null=True)
    plaid_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    date = models.DateTimeField()
    address_city = models.CharField(max_length=255, null=True)
    address_street = models.CharField(max_length=255, null=True)
    address_state = models.CharField(max_length=255, null=True)

    objects = TransactionManager()

    def __str__(self):
        return '{} - ${}'.format(self.name, self.amount)
