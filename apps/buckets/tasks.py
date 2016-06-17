
from decimal import Decimal
from dateutil.relativedelta import relativedelta

from celery import shared_task

from apps.core.utils import this_month
from apps.transactions.models import Transaction
from apps.users.models import User
from .models import Bucket


@shared_task
def assign_bucket_transactions(user_id):
    user = User.objects.get(id=user_id)

    for bucket in Bucket.objects.filter(owner=user):
        bucket.assign_transactions()


def bill_month_match(transaction, month_start, ago):
    prev_month_start = month_start - relativedelta(months=ago)
    prev_month_end = month_start - relativedelta(months=ago - 1)

    amount_variation = transaction.amount * Decimal('.10')

    match_by_description = transaction.account.transactions.filter(
        description=transaction.description,
        date__gte=prev_month_start,
        date__lt=prev_month_end,
    )

    if len(match_by_description) is not 1:
        return False
    else:
        return match_by_description.filter(
            amount__gt=transaction.amount + amount_variation,
            amount__lt=transaction.amount - amount_variation,
        ).count() == 1


@shared_task
def autodetect_bills(user_id):
    user = User.objects.get(id=user_id)
    Bucket.objects.filter(owner=user, type='bill').delete()

    full_month_end = this_month()
    full_month_start = full_month_end - relativedelta(months=1)

    for transaction in Transaction.objects.filter(
        owner=user,
        date__gte=full_month_start,
        date__lt=full_month_end,
        amount__lt=0,
    ):
        if (
            bill_month_match(transaction, full_month_start, 0) and
            bill_month_match(transaction, full_month_start, 1) and
            bill_month_match(transaction, full_month_start, 2)
        ):
            Bucket.objects.create(
                owner=user,
                name=transaction.description,
                type='bill',
                filters=[{
                    'description_exact': transaction.description,
                    'account': transaction.account.id,
                }],
            ).assign_transactions()
