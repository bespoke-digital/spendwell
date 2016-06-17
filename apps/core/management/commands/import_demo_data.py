
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
from apps.buckets.models import Bucket
from apps.buckets.tasks import assign_bucket_transactions
from apps.goals.models import Goal


def import_demo_data():
    try:
        owner = User.objects.get(email='demo@spendwell.co')
    except User.DoesNotExist:
        return

    with open(os.path.join(settings.BASE_DIR, 'local/demo.json'), 'r') as demo_file:
        export = json.load(demo_file)

    print('clearing existing demo data')
    owner.institutions.all().delete()
    owner.buckets.all().delete()
    owner.goals.all().delete()

    institutions = {}
    accounts = {}
    transactions = {}
    buckets = {}
    goals = {}

    exported_on = delorean.parse(export['exported_on']).datetime
    today = delorean.now().truncate('day').datetime
    months_offset = relativedelta(today, exported_on).months
    oldest_month_offset = max(
        relativedelta(today, delorean.parse(t['date']).datetime).months
        for t in export['transactions']
    )

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
        date = exported_date + relativedelta(months=months_offset)

        current_month_offset = relativedelta(today, exported_date).months
        if current_month_offset == oldest_month_offset and date.day <= today.day:
            date = exported_date + relativedelta(months=oldest_month_offset)

        transaction = Transaction.objects.create(
            owner=owner,
            account=accounts[transaction_data['account']],
            description=transaction_data['description'],
            amount=Decimal(transaction_data['amount']),
            date=date,
            from_savings=transaction_data.get('from_savings', False),
            source='demo',
        )
        transactions[transaction_data['id']] = transaction

    for bucket_data in export['buckets']:
        for filter in bucket_data['filters']:
            if 'account' in filter:
                filter['account'] = accounts[filter['account']].id

        bucket = Bucket.objects.create(
            owner=owner,
            name=bucket_data['name'],
            type=bucket_data['type'],
            filters=bucket_data['filters'],
        )
        buckets[bucket_data['id']] = bucket

    for goal_data in export['goals']:
        goal = Goal.objects.create(
            owner=owner,
            name=goal_data['name'],
            monthly_amount=goal_data['monthly_amount'],
        )
        goals[goal_data['id']] = goal

    print('processing demo data')

    Transaction.objects.detect_transfers(owner)
    assign_bucket_transactions(owner.id)

    print('\ndata imported:')
    print('institutions', len(institutions))
    print('accounts', len(accounts))
    print('transactions', len(transactions))
    print('buckets', len(buckets))
    print('goals', len(goals))


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        import_demo_data()
