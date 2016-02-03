
from datetime import datetime
from decimal import Decimal

from django.utils import timezone
import graphene


class Summary(graphene.ObjectType):
    income = graphene.Int()
    allocated = graphene.Int()
    spent = graphene.Int()
    net = graphene.Int()


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Int()
    summary = graphene.Field(Summary, month=graphene.String())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return info.request_context.user.safe_to_spend()

    def resolve_summary(self, args, info):
        (year, month) = args['month'].split('/')
        (year, month) = (int(year), int(month))

        summary = info.request_context.user.summary(
            timezone.make_aware(datetime(year=year, month=month, day=1)),
        )

        for key, value in summary.items():
            summary[key] = int(value * Decimal(100))

        return Summary(**summary)
