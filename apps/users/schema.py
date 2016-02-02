
from datetime import datetime

from django.utils import timezone
import graphene

from apps.core.types import Money


class Summary(graphene.ObjectType):
    income = Money()
    allocated = Money()
    spent = Money()
    net = Money()


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
        return Summary(**info.request_context.user.summary(
            timezone.make_aware(datetime(year=year, month=month, day=1)),
        ))
