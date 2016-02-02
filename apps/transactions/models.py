
from decimal import Decimal
from datetime import datetime, timedelta

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import SWModel, SWQuerySet, SWManager
from apps.categories.models import Category
from apps.accounts.models import Account

from .utils import similarity


class TransactionsQuerySet(SWQuerySet):
    def sum(self):
        return self.aggregate(models.Sum('amount'))['amount__sum'] or 0


class TransactionManager(SWManager):
    queryset_class = TransactionsQuerySet

    def sum(self):
        return self.get_queryset().sum()

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

        transaction.description = json_data['name']
        transaction.amount = -Decimal(json_data['amount'])
        transaction.date = datetime(*map(int, json_data['date'].split('-')))

        if json_data['meta'].get('location'):
            transaction.address_city = json_data['meta']['location'].get('city')
            transaction.address_street = json_data['meta']['location'].get('street')
            transaction.address_state = json_data['meta']['location'].get('state')

        transaction.save()
        return transaction


class Transaction(SWModel):
    owner = models.ForeignKey('users.User', related_name='transactions')

    account = models.ForeignKey('accounts.Account', related_name='transactions')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    date = models.DateTimeField()

    transfer_to = models.ForeignKey('accounts.Account', related_name='incoming_transfers', null=True)
    transfer_pair = models.ForeignKey('self', null=True)

    bucket = models.ForeignKey('buckets.Bucket', related_name='transactions', null=True)
    category = models.ForeignKey('categories.Category', related_name='transactions', null=True)
    plaid_id = models.CharField(max_length=255, blank=True, null=True)
    address_city = models.CharField(max_length=255, null=True)
    address_street = models.CharField(max_length=255, null=True)
    address_state = models.CharField(max_length=255, null=True)

    objects = TransactionManager()

    def __str__(self):
        return '{} - ${}'.format(self.description, self.amount)


@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, raw, **kwargs):
    "detect account transfers"
    if not raw and created:
        potential_transfers = Transaction.objects.filter(
            owner=instance.owner,
            transfer_pair__isnull=True,
            amount=(-instance.amount),
            date__lte=instance.date + timedelta(days=3),
            date__gte=instance.date - timedelta(days=3),
        )

        if len(potential_transfers) == 0:
            return
        elif len(potential_transfers) == 1:
            transfer = potential_transfers[0]
        else:
            # Fall back on similarity of description. This may miss many cases.
            # TODO: find a better algo for this.
            transfer = sorted(
                potential_transfers,
                lambda t: similarity(t.description, instance.description),
            )[-1]

        transfer.transfer_pair = instance
        transfer.transfer_to = instance.account
        transfer.save()

        instance.transfer_pair = transfer
        instance.transfer_to = transfer.account
        instance.save()
