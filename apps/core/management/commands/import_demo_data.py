
from django.core.management.base import BaseCommand

from apps.core.utils.demo import import_demo_data


class Command(BaseCommand):
    help = 'Exports the GraphQL schema in JSON format.'

    def handle(self, *args, **options):
        import_demo_data()
