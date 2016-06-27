
import os
import csv
import json

from django.core.management.base import BaseCommand
from django.conf import settings
import delorean

from apps.users.models import User


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        owner = User.objects.get(email='aron@spendwell.co')

        export = {
            'institutions': [],
            'accounts': [],
            'transactions': [],
            'buckets': [],
            'goals': [],
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

        for transaction in owner.transactions.all():
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

        for goal in owner.goals.all():
            export['goals'].append({
                'id': goal.id,
                'name': goal.name,
                'monthly_amount': goal.monthly_amount,
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
