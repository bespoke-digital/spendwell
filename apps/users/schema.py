
from datetime import datetime

from django.utils import timezone
from graphene.contrib.django.fields import DjangoConnectionField
import graphene

from apps.core.types import Money
from apps.goals.schema import GoalMonthNode
from apps.goals.models import GoalMonth


class Summary(graphene.ObjectType):
    income = graphene.Field(Money)
    allocated = graphene.Field(Money)
    spent = graphene.Field(Money)
    net = graphene.Field(Money)

    goal_months = DjangoConnectionField(GoalMonthNode)

    def __init__(self, *args, **kwargs):
        self.current_month = kwargs.pop('current_month')
        return super(Summary, self).__init__(*args, **kwargs)

    def resolve_goal_months(self, args, info):
        qs = GoalMonth.objects.filter(
            goal__owner=info.request_context.user,
            month_start=self.current_month,
        )
        print('qs', qs)
        return qs


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Field(Money)
    summary = graphene.Field(Summary, month=graphene.String())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return info.request_context.user.safe_to_spend()

    def resolve_summary(self, args, info):
        (year, month) = args['month'].split('/')
        (year, month) = (int(year), int(month))

        current_month = timezone.make_aware(datetime(
            year=year,
            month=month,
            day=1,
        ))

        return Summary(
            current_month=current_month,
            **info.request_context.user.summary(current_month)
        )
