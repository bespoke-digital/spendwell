
from datetime import date

from django.db.models import Sum
from dateutil.relativedelta import relativedelta
import graphene

from apps.transactions.models import Transaction


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Int()
    income = graphene.Field(graphene.Int(), month=graphene.String())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return 0

    def resolve_income(self, args, info):
        (year, month) = args['month'].split('/')
        (year, month) = (int(year), int(month))
        month = date(year=year, month=month, day=1)

        transactions = [
            Transaction.objects.filter(
                date__gte=month - relativedelta(months=1),
                date__lt=month,
                amount__gt=0,
            ),
            Transaction.objects.filter(
                date__gte=month - relativedelta(months=2),
                date__lt=month - relativedelta(months=1),
                amount__gt=0,
            ),
            Transaction.objects.filter(
                date__gte=month - relativedelta(months=3),
                date__lt=month - relativedelta(months=2),
                amount__gt=0,
            ),
        ]

        transaction_sums = [
            queryset.aggregate(Sum('amount'))['amount__sum'] or 0
            for queryset in transactions
        ]

        return sum(transaction_sums) / len(transactions)
