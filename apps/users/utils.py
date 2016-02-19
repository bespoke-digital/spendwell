
from decimal import Decimal
from django.db.models import Sum
from dateutil.relativedelta import relativedelta

from apps.transactions.models import Transaction


def estimate_income(user, month_start):
    oldest = Transaction.objects.filter(amount__gt=0).order_by('date').first()
    if not oldest:
        return 0

    months_ago = relativedelta(month_start, oldest.date).months
    if months_ago > 3:
        months_ago = 3

    if months_ago == 0:
        return (
            Transaction.objects
            .filter(amount__gt=0)
            .is_transfer(False)
            .aggregate(Sum('amount'))['amount__sum'] or 0
        )
    else:
        transactions = [
            Transaction.objects.filter(
                owner=user,
                date__lt=month_start - relativedelta(months=month),
                date__gte=month_start - relativedelta(months=month + 1),
                amount__gt=0,
            ).is_transfer(False).aggregate(Sum('amount'))['amount__sum'] or 0
            for month in range(months_ago)
        ]

        return Decimal(sum(transactions)) / Decimal(len(transactions))
