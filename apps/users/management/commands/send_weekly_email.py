
from django.core.management.base import BaseCommand
from django.db.models import Count

from apps.users.tasks import send_weekly_email
from apps.users.models import User


class Command(BaseCommand):
    help = 'Triggers the day_start signal'

    def handle(self, *args, **options):
        user_ids = (
            User.objects
            .annotate(txn_count=Count('transactions'))
            .filter(txn_count__gt=0)
            .values_list('id', flat=True)
        )
        for user_id in user_ids:
            send_weekly_email.delay(user_id)
