
import graphene

from apps.core.fields import SWNode, SWConnectionField
from apps.core.types import Money
from .models import Goal, GoalMonth


class GoalNode(SWNode):
    monthly_amount = graphene.Field(Money)

    class Meta:
        model = Goal
        only_fields = (
            'name',
            'months',
            'monthly_amount',
        )


class GoalMonthNode(SWNode):
    name = graphene.Field(graphene.String())
    target_amount = graphene.Field(Money)
    filled_amount = graphene.Field(Money)

    class Meta:
        model = GoalMonth
        only_fields = (
            'name',
            'month_start',
            'target_amount',
            'filled_amount',
            'goal',
        )

    def resolve_name(self, args, info):
        return self.instance.goal.name

    def resolve_filled_amount(self, args, info):
        return self.instance.target_amount


class GoalsQuery(graphene.ObjectType):
    goal = graphene.relay.NodeField(GoalNode)
    goals = SWConnectionField(GoalNode)

    goal_month = graphene.relay.NodeField(GoalMonthNode)
    goal_months = SWConnectionField(GoalMonthNode)

    class Meta:
        abstract = True
