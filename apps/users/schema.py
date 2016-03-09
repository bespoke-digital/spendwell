
from graphene.contrib.django.fields import DjangoConnectionField
import graphene

from apps.core.types import Money, Month
from apps.goals.schema import GoalMonthNode
from apps.buckets.schema import BucketMonthNode
from apps.transactions.schema import TransactionNode
from apps.transactions.fields import TransactionConnectionField

from .summary import MonthSummary


class Summary(graphene.ObjectType):
    true_income = graphene.Field(Money())
    estimated_income = graphene.Field(Money())
    income = graphene.Field(Money())
    income_estimated = graphene.Field(graphene.Boolean())

    goals_total = graphene.Field(Money())
    bills_paid_total = graphene.Field(Money())
    bills_unpaid_total = graphene.Field(Money())
    spent = graphene.Field(Money())
    allocated = graphene.Field(Money())

    net = graphene.Field(Money())
    spent_from_savings = graphene.Field(Money())

    goal_months = DjangoConnectionField(GoalMonthNode)
    bucket_months = DjangoConnectionField(BucketMonthNode)
    bill_months = DjangoConnectionField(BucketMonthNode)
    transactions = TransactionConnectionField(TransactionNode)


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Field(Money())
    summary = graphene.Field(Summary, month=Month())
    first_month = graphene.Field(Month())

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return MonthSummary(info.request_context.user).net

    def resolve_summary(self, args, info):
        return MonthSummary(info.request_context.user, args['month'])

    def resolve_first_month(self, args, info):
        return info.request_context.user.transactions.order_by('date').first().date
