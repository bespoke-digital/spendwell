
import json
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from spendwell.schema import schema


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        with open(os.path.join(settings.BASE_DIR, 'spendwell/schema.json'), 'w') as schema_file:
            json.dump(schema.introspect(), schema_file)
