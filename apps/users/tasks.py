
from celery import shared_task
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from spendwell.mixpanel import mixpanel
from apps.core.utils import this_month, months_ago
from apps.core.utils.email import send_email
from apps.users.models import User

from .email import weekly_email_context


@shared_task
def estimate_income(user_id):
    user = User.objects.get(id=user_id)

    current_month = this_month()
    income_months = [
        user.transactions
        .filter(amount__gt=0)
        .filter(account__disabled=False)
        .filter(date__lt=current_month - relativedelta(months=i))
        .filter(date__gte=current_month - relativedelta(months=i + 1))
        .is_transfer(False)
        .sum()
        for i in range(months_ago(user.first_data_month()) - 1)
    ]

    if len(income_months) > 0:
        user.estimated_income = min(income_months)
    else:
        user.estimated_income = 0

    user.save()


@shared_task
def user_sync_complete(user_id):
    user = User.objects.get(id=user_id)

    if not user.last_sync:
        mixpanel.track(user.id, 'sync: init')
        send_email(
            user=user,
            subject='Get Started With Spendwell',
            template='users/email/sync-notification.html',
        )

    user.last_sync = timezone.now()
    user.save()

    mixpanel.track(user.id, 'sync: success')


@shared_task
def send_weekly_email(user_id):
    user = User.objects.get(id=user_id)
    context = weekly_email_context(user)
    send_email(
        user=user,
        subject=context['subject'],
        template='users/email/weekly.html',
        context=context,
    )
    mixpanel.track(user_id, 'Email Send', {'email': user.email})
