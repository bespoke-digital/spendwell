
from graphene.contrib.django.fields import DjangoConnectionField
import graphene

from apps.core.types import Money, Month
from apps.goals.schema import GoalMonthNode
from apps.goals.models import GoalMonth


class Summary(graphene.ObjectType):
    income = graphene.Field(Money())
    allocated = graphene.Field(Money())
    spent = graphene.Field(Money())
    net = graphene.Field(Money())

    goal_months = DjangoConnectionField(GoalMonthNode)

    def __init__(self, *args, **kwargs):
        self.month_start = kwargs.pop('month_start')
        return super(Summary, self).__init__(*args, **kwargs)

    def resolve_goal_months(self, args, info):
        return GoalMonth.objects.filter(
            goal__owner=info.request_context.user,
            month_start=self.month_start,
        )


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Field(Money())
    summary = graphene.Field(Summary, month=Month())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return info.request_context.user.safe_to_spend()

    def resolve_summary(self, args, info):
        return Summary(
            month_start=args['month'],
            **info.request_context.user.summary(args['month'])
        )
