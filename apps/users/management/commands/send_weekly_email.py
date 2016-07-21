
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils.timezone import now

from apps.users.tasks import send_weekly_email
from apps.users.models import User


class Command(BaseCommand):
    help = 'Triggers the day_start signal'

    def handle(self, *args, **options):
        users = User.objects.annotate(txn_count=Count('transactions')).filter(txn_count__gt=0)
        max_age = now() - timedelta(days=7)
        for user in users:
            if user.transactions.order_by('-date').first().date < max_age:
                continue

            send_weekly_email.delay(user.id)
