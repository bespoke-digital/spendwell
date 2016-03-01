
from django.core.management.base import BaseCommand

from apps.core.signals import month_start
from apps.core.utils import this_month


class Command(BaseCommand):
    help = 'Triggers the month_start signal'

    def handle(self, *args, **options):
        month_start.send(sender=None, month=this_month())
