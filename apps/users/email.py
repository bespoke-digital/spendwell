
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
    this_month_start = this_month()
    summary = MonthSummary(user, this_month_start)

    last_transaction = user.transactions.order_by('-date').first()
    if not last_transaction or last_transaction.date < this_month_start:
        spending_chart_url = None

    else:
        this_month_data = []
        for day in rrule.rrule(rrule.DAILY, dtstart=this_month_start, until=last_transaction.date):
            day_summary = MonthSummary(user, this_month_start, day)
            this_month_data.append(int(abs(day_summary.spent - day_summary.bills_paid_total)))

        last_month_start = this_month_start - relativedelta(months=1)

        last_month_data = []
        for day in rrule.rrule(rrule.DAILY, dtstart=last_month_start, until=this_month_start):
            day_summary = MonthSummary(user, last_month_start, day)
            last_month_data.append(int(abs(day_summary.spent - day_summary.bills_paid_total)))

        chart_options = {
            'template': 'weekly-email-status',
            'options': {
                'type': 'line',
                'size': {'height': 200, 'width': 568},
                'data': {
                    'labels': list(range(1, len(last_month_data))),
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
                                float(this_month_data[-1] + summary.net),
                            ] * len(last_month_data),
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
        'subject': 'Your Money as of {}'.format(defaultfilters.date(last_transaction.date)),
        'spending_chart_url': spending_chart_url,
        'summary': summary,
        'upcoming_bill_months': upcoming_bill_months,
        'as_of': last_transaction.date,
        'event_properties': {
            'email type': 'weekly',
        },
    }
