
from datetime import datetime

from django.utils import timezone
import graphene


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Int()
    income = graphene.Field(graphene.Int(), month=graphene.String())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return info.request_context.user.safe_to_spend()

    def resolve_income(self, args, info):
        (year, month) = args['month'].split('/')
        (year, month) = (int(year), int(month))
        return info.request_context.user.income(
            timezone.make_aware(datetime(year=year, month=month, day=1)),
        )
