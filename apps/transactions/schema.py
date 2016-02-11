
import graphene

from apps.core.fields import SWNode, SWFilterConnectionField
from apps.core.types import Money

from .models import Transaction
from .filters import TransactionFilter


class TransactionNode(SWNode):
    amount = graphene.Field(Money)

    class Meta:
        model = Transaction
        filter_order_by = ('date',)
        only_fields = (
            'description',
            'date',
            'amount',
            'category',
            'account',
            'transfer_pair',
            'pending',
        )

    @staticmethod
    def get_queryset(queryset, args, info):
        return queryset.filter(account__disabled=False)


class TransactionsQuery(graphene.ObjectType):
    transaction = graphene.relay.NodeField(TransactionNode)
    transactions = SWFilterConnectionField(
        TransactionNode,
        filterset_class=TransactionFilter,
    )

    class Meta:
        abstract = True
