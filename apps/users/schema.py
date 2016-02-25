
from graphene.contrib.django.fields import DjangoConnectionField
import graphene

from apps.core.types import Money, Month
from apps.goals.schema import GoalMonthNode
from apps.buckets.schema import BucketMonthNode
from apps.transactions.schema import TransactionNode
from apps.transactions.fields import TransactionConnectionField

from .summary import MonthSummary


class Summary(graphene.ObjectType):
    income = graphene.Field(Money())
    allocated = graphene.Field(Money())
    spent = graphene.Field(Money())
    net = graphene.Field(Money())
    spent_from_savings = graphene.Field(Money())

    goal_months = DjangoConnectionField(GoalMonthNode)
    bucket_months = DjangoConnectionField(BucketMonthNode)
    bill_months = DjangoConnectionField(BucketMonthNode)
    transactions = TransactionConnectionField(TransactionNode)


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Field(Money())
    summary = graphene.Field(Summary, month=Month())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return MonthSummary(info.request_context.user).net

    def resolve_summary(self, args, info):
        return MonthSummary(info.request_context.user, args['month'])
