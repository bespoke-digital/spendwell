
import graphene
from graphene.contrib.django.fields import DjangoConnectionField
from graphene.utils import with_context
from graphene.relay.types import Connection

from apps.core.fields import SWNode
from apps.core.types import Money
from apps.core.utils import months_avg, this_month
from apps.buckets.models import Bucket

from .models import Transaction
from .fields import TransactionConnectionField


class TransactionConnection(Connection):
    avg_amount = graphene.Field(Money())

    @with_context
    def resolve_avg_amount(self, args, context, info):
        return months_avg(self._connection_data, month_start=this_month())


class TransactionNode(SWNode):
    amount = graphene.Field(Money)
    buckets = DjangoConnectionField('BucketNode')
    transfer_pair = graphene.Field('TransactionNode')
    djid = graphene.Field(graphene.Int())
    source = graphene.Field(graphene.String())

    connection_type = TransactionConnection

    class Meta:
        model = Transaction
        only_fields = (
            'description',
            'raw_description',
            'date',
            'amount',
            'account',
            'transfer_pair',
            'pending',
            'bucket_months',
            'buckets',
            'savings',
            'balance',
            'from_savings',
            'source',
        )

    @staticmethod
    def get_queryset(queryset, args, info):
        return queryset.filter(account__disabled=False)

    @with_context
    def resolve_buckets(self, args, context, info):
        return Bucket.objects.filter(
            owner=context.user,
            transactions=self.instance,
        ).distinct()


class TransactionsQuery(graphene.ObjectType):
    transaction = graphene.relay.NodeField(TransactionNode)
    transactions = TransactionConnectionField(TransactionNode)

    class Meta:
        abstract = True
