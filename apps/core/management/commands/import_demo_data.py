
import json
import os
from decimal import Decimal

from django.conf import settings
from django.core.management.base import BaseCommand

from dateutil.relativedelta import relativedelta
import delorean

from apps.users.models import User
from apps.institutions.models import Institution
from apps.accounts.models import Account
from apps.transactions.models import Transaction


def import_demo_data():
    with open(os.path.join(settings.BASE_DIR, 'local/demo.json'), 'r') as demo_file:
        export = json.load(demo_file)
    owner = User.objects.get(email='demo@spendwell.co')

    print('clearing existing demo data')
    owner.institutions.all().delete()

    institutions = {}
    accounts = {}

    exported_on = delorean.parse(export['exported_on']).datetime
    today = delorean.now().truncate('day').datetime
    months_offset = relativedelta(today, exported_on).months

    print('importing demo data')

    for institution_data in export['institutions']:
        institution = Institution.objects.create(
            owner=owner,
            name=institution_data['name'],
        )
        institutions[institution_data['id']] = institution

    for account_data in export['accounts']:
        if account_data['current_balance']:
            current_balance = Decimal(account_data['current_balance'])
        else:
            current_balance = None

        account = Account.objects.create(
            owner=owner,
            institution=institutions[account_data['institution']],
            name=account_data['name'],
            type=account_data['type'],
            subtype=account_data['subtype'],
            current_balance=current_balance,
        )
        accounts[account_data['id']] = account

    for transaction_data in export['transactions']:
        exported_date = delorean.parse(transaction_data['date']).datetime
        date = exported_date - relativedelta(months=months_offset)
        if relativedelta(today, date).months == 3 and date.day <= today.day:
            date = exported_date + relativedelta(months=3)

        Transaction.objects.create(
            owner=owner,
            account=accounts[transaction_data['account']],
            description=transaction_data['description'],
            amount=Decimal(transaction_data['amount']),
            date=date,
            category_id=transaction_data['category_id'],
            from_savings=transaction_data.get('from_savings', False),
            source='demo',
        )

    print('processing demo data')

    Transaction.objects.detect_transfers(owner)


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        import_demo_data()
