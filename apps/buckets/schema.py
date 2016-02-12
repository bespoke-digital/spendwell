
import graphene
from graphene.contrib.django.fields import DjangoConnectionField

from apps.core.fields import SWNode, SWConnectionField
from apps.core.types import Money
from apps.transactions.schema import TransactionNode
from .models import Bucket, BucketMonth


class BucketNode(SWNode):
    transactions = DjangoConnectionField(TransactionNode)

    class Meta:
        model = Bucket
        only_fields = (
            'name',
            'months',
            'transactions',
        )

    def resolve_transactions(self, args, info):
        return self.instance.transactions()


class BucketMonthNode(SWNode):
    name = graphene.Field(graphene.String())
    amount = graphene.Field(Money)
    avg_amount = graphene.Field(Money)

    class Meta:
        model = BucketMonth
        only_fields = (
            'name',
            'month_start',
            'transactions',
            'amount',
            'avg_amount',
            'bucket',
        )

    def resolve_name(self, args, info):
        return self.instance.bucket.name


class BucketsQuery(graphene.ObjectType):
    bucket = graphene.relay.NodeField(BucketNode)
    buckets = SWConnectionField(BucketNode)

    bucket_month = graphene.relay.NodeField(BucketMonthNode)
    bucket_months = SWConnectionField(BucketMonthNode)

    class Meta:
        abstract = True
