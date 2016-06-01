
import graphene
from graphene.contrib.django.fields import DjangoConnectionField

from apps.core.fields import SWNode
from apps.core.types import Money
from apps.buckets.models import Bucket

from .models import Transaction
from .fields import TransactionConnectionField


class TransactionNode(SWNode):
    amount = graphene.Field(Money)
    buckets = DjangoConnectionField('BucketNode')
    transfer_pair = graphene.Field('TransactionNode')
    djid = graphene.Field(graphene.Int())
    source = graphene.Field(graphene.String())

    class Meta:
        model = Transaction
        only_fields = (
            'description',
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

    def resolve_buckets(self, args, info):
        return Bucket.objects.filter(
            owner=info.request_context.user,
            transactions=self.instance,
        ).distinct()


class TransactionsQuery(graphene.ObjectType):
    transaction = graphene.relay.NodeField(TransactionNode)
    transactions = TransactionConnectionField(TransactionNode)

    class Meta:
        abstract = True
