
from django.core.management.base import BaseCommand

from apps.institutions.utils import sync_all


class Command(BaseCommand):
    help = 'Triggers a sync for all users'

    def handle(self, *args, **options):
        sync_all()
