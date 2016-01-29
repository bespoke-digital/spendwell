
import graphene

from apps.core.schema import OwnedNode, OwnedConnectionField
from .models import Transaction


class TransactionNode(OwnedNode):
    class Meta:
        model = Transaction
        filter_order_by = ['name']


class TransactionsQuery(graphene.ObjectType):
    transaction = graphene.relay.NodeField(TransactionNode)
    transactions = OwnedConnectionField(TransactionNode)

    class Meta:
        abstract = True
