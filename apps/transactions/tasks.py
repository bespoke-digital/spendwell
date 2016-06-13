
from celery import shared_task

from apps.users.models import User
from .models import Transaction


@shared_task
def detect_transfers(user_id):
    user = User.objects.get(id=user_id)
    Transaction.objects.detect_transfers(user)
