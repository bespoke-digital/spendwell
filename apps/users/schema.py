
import delorean
import graphene
from graphene.contrib.django.fields import DjangoConnectionField

from apps.core.types import Money, Month
from apps.goals.schema import GoalMonthNode
from apps.transactions.schema import TransactionNode
from apps.transactions.fields import TransactionConnectionField
from apps.buckets.schema import BucketNode
from apps.buckets.models import Bucket

from .summary import MonthSummary, bucket_month


class BucketMonthNode(graphene.relay.Node):
    bucket = graphene.Field(BucketNode)
    month = graphene.Field(Month())
    amount = graphene.Field(Money())
    avg_amount = graphene.Field(Money())
    transactions = TransactionConnectionField(TransactionNode)

    @classmethod
    def get_node(Cls, id, info):
        bucket_id, month_start = id.split(':')

        month_start = delorean.parse('{}/01'.format(month_start)).truncate('month').datetime
        bucket = Bucket.objects.get(id=bucket_id)

        return Cls(**bucket_month(bucket, month_start))

    def to_global_id(self):
        return self.global_id('{}:{:%Y/%m}'.format(
            self.bucket.id,
            self.month,
        ))


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
    bucket_months = graphene.relay.ConnectionField(BucketMonthNode)
    transactions = TransactionConnectionField(TransactionNode)


class Settings(graphene.ObjectType):
    timezone = graphene.Field(graphene.String())
    estimated_income_confirmed = graphene.Field(graphene.Boolean())
    dashboard_help = graphene.Field(graphene.Boolean())
    create_label_help = graphene.Field(graphene.Boolean())
    create_bill_help = graphene.Field(graphene.Boolean())
    create_goal_help = graphene.Field(graphene.Boolean())


class UsersQuery(graphene.ObjectType):
    bucket_month = graphene.relay.NodeField(BucketMonthNode)
    summary = graphene.Field(Summary, month=Month())

    safe_to_spend = graphene.Field(Money())
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
