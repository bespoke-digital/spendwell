
from decimal import Decimal

import delorean
from dateutil.relativedelta import relativedelta


def this_month():
    return delorean.now().truncate('month').datetime


def months_ago(d1, d2=None):
    if d2 is None:
        d2 = this_month()

    return ((d2.year - d1.year) * 12) + (d2.month - d1.month)


def months_avg(queryset, months=3, month_start=None, date_field='date'):
    if month_start is None:
        month_start = this_month()

    furthest_back = queryset.order_by(date_field).values_list(date_field, flat=True).first()
    if furthest_back is None:
        return 0

    months_ago = relativedelta(month_start, furthest_back).months + 1

    if months_ago <= 0:
        return 0

    if months_ago > months:
        months_ago = months

    total = Decimal(queryset.filter(
        date__gte=month_start - relativedelta(months=months_ago),
        date__lt=month_start,
    ).sum())

    return total / Decimal(months_ago)
