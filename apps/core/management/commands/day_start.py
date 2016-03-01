
from django.core.management.base import BaseCommand

from apps.core.signals import day_start


class Command(BaseCommand):
    help = 'Triggers the day_start signal'

    def handle(self, *args, **options):
        day_start.send(sender=None)
