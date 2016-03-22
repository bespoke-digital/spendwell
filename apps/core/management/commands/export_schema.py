
import json

from django.core.management.base import BaseCommand

from spendwell.schema import schema


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        print(json.dumps(schema.introspect(), indent=2))
