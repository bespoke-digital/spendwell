
from graphene.contrib.django.fields import DjangoConnectionField
import graphene

from apps.core.types import Money, Month
from apps.goals.schema import GoalMonthNode
from apps.buckets.schema import BucketMonthNode
from apps.transactions.schema import TransactionNode
from apps.transactions.fields import TransactionConnectionField

from .summary import MonthSummary


class Summary(graphene.ObjectType):
    month_start = graphene.Field(Month())

    true_income = graphene.Field(Money())
    from_savings_income = graphene.Field(Money())
    income = graphene.Field(Money())
    income_estimated = graphene.Field(graphene.Boolean())
    estimated_income = graphene.Field(Money())

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


class Settings(graphene.ObjectType):
    timezone = graphene.Field(graphene.String())
    dashboard_help = graphene.Field(graphene.Boolean())


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Field(Money())
    summary = graphene.Field(Summary, month=Month())
    first_month = graphene.Field(Month())
    email = graphene.Field(graphene.String())
    is_admin = graphene.Field(graphene.Boolean())
    estimated_income = graphene.Field(Money())

    settings = graphene.Field(Settings)

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return MonthSummary(info.request_context.user).net

    def resolve_summary(self, args, info):
        return MonthSummary(info.request_context.user, args['month'])

    def resolve_first_month(self, args, info):
        return info.request_context.user.first_data_month()

    def resolve_email(self, args, info):
        return info.request_context.user.email

    def resolve_is_admin(self, args, info):
        return info.request_context.user.is_admin

    def resolve_estimated_income(self, args, info):
        return info.request_context.user.estimated_income

    def resolve_settings(self, args, info):
        return info.request_context.user
