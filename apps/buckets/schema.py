
from collections import namedtuple
import graphene

from apps.core.fields import SWNode, SWFilterConnectionField
from apps.core.utils import node_id_from_instance
from apps.transactions.schema import TransactionNode
from apps.transactions.utils import filter_list_schema
from apps.transactions.filters import TransactionFilter
from apps.transactions.fields import TransactionConnectionField
from apps.accounts.models import Account

from .models import Bucket
from .filters import BucketFilter


class BucketNode(SWNode):
    transactions = TransactionConnectionField(TransactionNode)
    filters = filter_list_schema(TransactionFilter, name='BucketFilters', input=False)
    type = graphene.Field(graphene.String())
    avatar = graphene.Field(graphene.String())

    class Meta:
        model = Bucket
        only_fields = (
            'name',
            'months',
            'transactions',
            'filters',
            'type',
        )

    def resolve_transactions(self, args, info):
        return self.instance.transactions.all()

    def resolve_filters(self, args, info):
        filters = []

        for filter in self.instance.filters:
            if 'account' in filter:
                filter['account'] = node_id_from_instance(model=Account, id=filter['account'])
            filters.append(namedtuple('Filter', filter.keys())(**filter))

        return filters

    def resolve_avatar(self, args, info):
        if self.instance.avatar:
            return self.instance.avatar.url


class BucketsQuery(graphene.ObjectType):
    bucket = graphene.relay.NodeField(BucketNode)
    buckets = SWFilterConnectionField(BucketNode, filterset_class=BucketFilter)

    class Meta:
        abstract = True
