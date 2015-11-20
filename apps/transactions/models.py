
from decimal import Decimal
from datetime import datetime

from django.db import models

from apps.core.models import MBOwnedModel
from apps.categories.models import Category


class TransactionManager(models.Manager):
    def create_from_json(self, json_data):
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
        transaction = Transaction()
        transaction.plaid_id = json_data['_id']
        transaction.name = json_data['name']
        transaction.amount = Decimal(json_data['amount'])
        transaction.date = datetime(json_data['date'])
        transaction.address_city = json_data['meta']['location']['city']
        transaction.address_street = json_data['meta']['location']['street']
        transaction.address_state = json_data['meta']['location']['state']
        transaction.category = Category.objects.get(plaid_id=json_data['category_id'])
        transaction.save()
        return transaction


class Transaction(MBOwnedModel):
    account = models.ForeignKey('accounts.Account', related_name='transactions')
    category = models.ForeignKey('categories.Category', related_name='transactions')
    plaid_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    date = models.DateTimeField()
    address_city = models.CharField(max_length=255)
    address_street = models.CharField(max_length=255)
    address_state = models.CharField(max_length=255)

    objects = TransactionManager()
