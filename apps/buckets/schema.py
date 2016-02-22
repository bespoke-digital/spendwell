
import graphene

from apps.core.fields import SWNode, SWConnectionField
from apps.core.types import Money
from apps.transactions.schema import TransactionNode
from apps.transactions.utils import filter_list_schema
from apps.transactions.filters import TransactionFilter
from apps.transactions.fields import TransactionConnectionField

from .models import Bucket, BucketMonth


class BucketNode(SWNode):
    transactions = TransactionConnectionField(TransactionNode)
    filters = filter_list_schema(TransactionFilter, name='BucketFilters', input=False)

    class Meta:
        model = Bucket
        only_fields = (
            'name',
            'months',
            'transactions',
            'filters',
        )

    def resolve_transactions(self, args, info):
        return self.instance.transactions()


class BucketMonthNode(SWNode):
    name = graphene.Field(graphene.String())
    amount = graphene.Field(Money)
    avg_amount = graphene.Field(Money)
    transactions = TransactionConnectionField(TransactionNode)

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
