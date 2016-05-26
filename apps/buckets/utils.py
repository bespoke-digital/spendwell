
from decimal import Decimal
from dateutil.relativedelta import relativedelta

from apps.core.utils import this_month
from apps.transactions.models import Transaction
from .models import Bucket


def test_month_ago(transaction, month_start, ago):
    prev_month_start = month_start - relativedelta(months=ago)
    prev_month_end = month_start - relativedelta(months=ago - 1)

    amount_variation = transaction.amount * Decimal('.10')

    description_match_count = transaction.account.transactions.filter(
        description=transaction.description,
        date__gte=prev_month_start,
        date__lt=prev_month_end,
    ).count()

    if not description_match_count == 1:
        return False

    amount_match_count = transaction.account.transactions.filter(
        description=transaction.description,
        date__gte=prev_month_start,
        date__lt=prev_month_end,
        amount__gt=transaction.amount + amount_variation,
        amount__lt=transaction.amount - amount_variation,
    ).count()

    if not amount_match_count == 1:
        return False

    return True


def autodetect_bills(user):
    full_month_end = this_month()
    full_month_start = full_month_end - relativedelta(months=1)

    Bucket.objects.filter(owner=user, type='bill').delete()

    for transaction in Transaction.objects.filter(
        owner=user,
        date__gte=full_month_start,
        date__lt=full_month_end,
        amount__lt=0,
    ):
        if (
            test_month_ago(transaction, full_month_start, 1) and
            test_month_ago(transaction, full_month_start, 2)
        ):
            Bucket.objects.create(
                owner=user,
                name=transaction.description,
                type='bill',
                filters=[{'description_exact': transaction.description}],
            ).assign_transactions()
