
from dateutil.relativedelta import relativedelta
from dateutil import rrule
from datetime import timedelta

from django.conf import settings
from django.utils.timezone import now
from django.template import defaultfilters
import requests

from apps.core.utils.date import this_month
from .summary import MonthSummary, BucketMonth


GREEN_500 = '#4CAF50'
GREEN_200 = '#A5D6A7'
BLUE_A200 = '#40C4FF'
BLUE_A100 = '#80D8FF'
ORANGE_500 = '#FF5722'
ORANGE_200 = '#FFAB91'
TRANSPARENT = 'transparent'
GREY_400 = '#BDBDBD'
GREY_500 = '#9E9E9E'
GREY_600 = '#757575'


def weekly_email_context(user):
    month_start = this_month()
    month_end = month_start + relativedelta(months=1)

    last_transaction = user.transactions.order_by('-date').first()

    if last_transaction and last_transaction.date < month_end:
        month_end = last_transaction.date

    summary = MonthSummary(user, month_start, month_end)

    if not last_transaction or last_transaction.date < month_start:
        spending_chart_url = None

    else:
        this_month_data = []
        for day in rrule.rrule(rrule.DAILY, dtstart=month_start, until=month_end):
            day_summary = MonthSummary(user, month_start, day)
            this_month_data.append(int(abs(day_summary.spent - day_summary.bills_paid_total)))

        last_month_start = month_start - relativedelta(months=1)

        last_month_data = []
        for day in rrule.rrule(rrule.DAILY, dtstart=last_month_start, until=month_start):
            day_summary = MonthSummary(user, last_month_start, day)
            last_month_data.append(int(abs(day_summary.spent - day_summary.bills_paid_total)))

        if len(last_month_data) > len(this_month_data):
            chart_length = len(last_month_data)
        else:
            chart_length = len(this_month_data)

        chart_options = {
            'template': 'weekly-email-status',
            'options': {
                'type': 'line',
                'size': {'height': 200, 'width': 568},
                'data': {
                    'labels': list(range(1, chart_length)),
                    'datasets': [
                        {
                            'label': 'This Month',
                            'data': this_month_data,
                            'fill': False,
                            'backgroundColor': GREEN_200,
                            'borderColor': GREEN_500,
                            'borderWidth': 2,
                            'pointRadius': 1,
                            'pointBackgroundColor': GREEN_200,
                            'pointBorderColor': TRANSPARENT,
                        },
                        {
                            'label': 'Last Month',
                            'data': last_month_data,
                            'fill': False,
                            'backgroundColor': TRANSPARENT,
                            'borderColor': GREY_500,
                            'borderWidth': 1,
                            'borderDash': [3, 3],
                            'pointRadius': 1,
                            'pointBackgroundColor': TRANSPARENT,
                            'pointBorderColor': TRANSPARENT,
                        },
                        {
                            'label': 'Safe to Spend',
                            'data': [
                                float(summary.net + this_month_data[-1]),
                            ] * chart_length,
                            'fill': False,
                            'backgroundColor': TRANSPARENT,
                            'borderColor': GREY_600,
                            'borderWidth': 1,
                            'pointRadius': 1,
                            'pointBackgroundColor': TRANSPARENT,
                            'pointBorderColor': TRANSPARENT,
                        },
                    ],
                },
            },
        }

        url = 'https://charturl.com/short-urls.json?api_key={}'.format(settings.CHARTURL_API_KEY)
        response = requests.post(url, json=chart_options)

        spending_chart_url = response.json().get('short_url')

    upcoming_bill_months = []
    for bill in user.buckets.filter(type='bill'):
        bill_month = BucketMonth(bill)

        if bill_month.bill_paid:
            continue

        if bill_month.bill_due_date is None:
            continue

        if bill_month.bill_due_date - now() < timedelta(days=7):
            upcoming_bill_months.append(bill_month)

    return {
        'subject': 'Your Money as of {}'.format(defaultfilters.date(month_end)),
        'spending_chart_url': spending_chart_url,
        'summary': summary,
        'upcoming_bill_months': upcoming_bill_months,
        'as_of': last_transaction.date,
        'event_properties': {
            'email type': 'weekly',
        },
    }
