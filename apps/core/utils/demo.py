
import os
import csv
import json
from decimal import Decimal

from django.conf import settings
from dateutil.relativedelta import relativedelta
import delorean

from apps.users.models import User
from apps.institutions.models import Institution
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.buckets.models import Bucket
from apps.buckets.tasks import assign_bucket_transactions


def export_demo_data():
    owner = User.objects.get(email='demo@spendwell.co')

    export = {
        'institutions': [],
        'accounts': [],
        'transactions': [],
        'buckets': [],
    }

    for institution in owner.institutions.all():
        export['institutions'].append({
            'id': institution.id,
            'name': institution.name,
        })

    for account in owner.accounts.filter(disabled=False):
        export['accounts'].append({
            'id': account.id,
            'institution': account.institution.id,
            'name': account.name,
            'type': account.type,
            'subtype': account.subtype,
            'current_balance': account.current_balance,
        })

        for transaction in account.transactions.all():
            export['transactions'].append({
                'id': transaction.id,
                'account': transaction.account.id,
                'description': transaction.description,
                'amount': transaction.amount,
                'date': transaction.date.isoformat(),
            })

    for bucket in owner.buckets.all():
        export['buckets'].append({
            'id': bucket.id,
            'name': bucket.name,
            'type': bucket.type,
            'filters': json.dumps(bucket._filters),
        })

    try:
        os.makedirs(settings.DEMO_DATA_DIR)
    except FileExistsError:
        pass

    with open(os.path.join(settings.DEMO_DATA_DIR, 'export_date'), 'w') as demo_file:
        demo_file.write(delorean.now().truncate('day').datetime.isoformat())

    for key, values in export.items():
        if len(values) == 0:
            continue
        with open(os.path.join(settings.DEMO_DATA_DIR, '{}.csv'.format(key)), 'w') as demo_file:
            writer = csv.DictWriter(demo_file, fieldnames=values[0].keys())
            writer.writeheader()
            for row in values:
                writer.writerow(row)


def import_demo_data():
    try:
        owner = User.objects.get(email='demo@spendwell.co')
    except User.DoesNotExist:
        return

    export = {}

    try:
        for data_name in [
            'institutions',
            'accounts',
            'transactions',
            'buckets',
        ]:
            data_file_name = os.path.join(settings.DEMO_DATA_DIR, '{}.csv'.format(data_name))
            with open(data_file_name, 'r') as data_file:
                export[data_name] = [row for row in csv.DictReader(data_file)]

        with open(os.path.join(settings.DEMO_DATA_DIR, 'export_date'), 'r') as data_file:
            exported_on = delorean.parse(data_file.read()).datetime

    except FileNotFoundError:
        print('Unable to load demo data: files missing')
        return

    print('clearing existing demo data')
    owner.institutions.all().delete()
    owner.buckets.all().delete()

    institutions = {}
    accounts = {}
    transactions = {}
    buckets = {}

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
        accounts[int(account_data['id'])] = account

    for transaction_data in export['transactions']:
        exported_date = delorean.parse(transaction_data['date']).datetime
        date = exported_date + relativedelta(months=months_offset)

        current_month_offset = relativedelta(today, exported_date).months
        if current_month_offset == oldest_month_offset and date.day <= today.day:
            date = exported_date + relativedelta(months=oldest_month_offset)

        transaction = Transaction.objects.create(
            owner=owner,
            account=accounts[int(transaction_data['account'])],
            description=transaction_data['description'],
            amount=Decimal(transaction_data['amount']),
            date=date,
            source='demo',
        )
        transactions[transaction_data['id']] = transaction

    for bucket_data in export['buckets']:
        filters = json.loads(bucket_data['filters'])
        for filter in filters:
            if 'account' in filter:
                filter['account'] = accounts[int(filter['account'])].id

        bucket = Bucket.objects.create(
            owner=owner,
            name=bucket_data['name'],
            type=bucket_data['type'],
            filters=filters,
        )
        buckets[bucket_data['id']] = bucket

    print('processing demo data')

    Transaction.objects.detect_transfers(owner)
    assign_bucket_transactions(owner.id)

    print('\ndata imported:')
    print('institutions', len(institutions))
    print('accounts', len(accounts))
    print('transactions', len(transactions))
    print('buckets', len(buckets))
