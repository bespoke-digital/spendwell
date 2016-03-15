
from collections import namedtuple
import graphene

from apps.core.fields import SWNode, SWConnectionField, SWFilterConnectionField
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
            'type',
        )
        filter_fields = ('type',)

    def resolve_transactions(self, args, info):
        return self.instance.transactions()

    def resolve_filters(self, args, info):
        return [
            namedtuple('Filter', filter.keys())(**filter)
            for filter in self.instance.filters
        ]


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
            'type',
        )

    def resolve_name(self, args, info):
        return self.instance.bucket.name


class BucketsQuery(graphene.ObjectType):
    bucket = graphene.relay.NodeField(BucketNode)
    buckets = SWFilterConnectionField(BucketNode)

    bucket_month = graphene.relay.NodeField(BucketMonthNode)
    bucket_months = SWConnectionField(BucketMonthNode)

    class Meta:
        abstract = True
