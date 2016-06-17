
import json
import os

from django.core.serializers.json import DjangoJSONEncoder
from django.core.management.base import BaseCommand
from django.conf import settings
import delorean

from apps.users.models import User


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        owner = User.objects.get(email='demo@spendwell.co')

        today = delorean.now().truncate('day').datetime

        export = {
            'institutions': [],
            'accounts': [],
            'transactions': [],
            'buckets': [],
            'goals': [],
            'exported_on': today,
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
                'date': transaction.date,
                'from_savings': transaction.from_savings,
            })

        for bucket in owner.buckets.all():
            export['buckets'].append({
                'id': bucket.id,
                'name': bucket.name,
                'type': bucket.type,
                'filters': bucket._filters,
            })

        for goal in owner.goals.all():
            export['goals'].append({
                'id': goal.id,
                'name': goal.name,
                'monthly_amount': goal.monthly_amount,
            })

        with open(os.path.join(settings.BASE_DIR, 'local/demo.json'), 'w') as demo_file:
            json.dump(export, demo_file, cls=DjangoJSONEncoder, indent=2)
