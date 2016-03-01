
from delorean import now

from django.core.management.base import BaseCommand

from apps.core.signals import day_start, month_start
from apps.core.utils import this_month


class Command(BaseCommand):
    help = 'Triggers the day_start signal'

    def handle(self, *args, **options):
        day_start.send(sender=None)

        if now().datetime.day == 1:
            month_start.send(sender=None, month=this_month())
