
import graphene
import django_filters

from apps.core.schema import OwnedNode, OwnedFilterConnectionField
from apps.core.types import Money
from .models import Transaction


class TransactionFilter(django_filters.FilterSet):
    is_transfer = django_filters.BooleanFilter(
        name='transfer_to',
        lookup_type='isnull',
        exclude=True,
    )
    amount_lt = django_filters.NumberFilter(name='amount', lookup_type='lt')
    amount_gt = django_filters.NumberFilter(name='amount', lookup_type='gt')

    class Meta:
        model = Transaction
        order_by = ('date',)
        fields = (
            'is_transfer',
            'amount_gt',
            'amount_lt',
        )


class TransactionNode(OwnedNode):
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
            'transfer_to',
            'pending',
        )
        filter_fields = (

        )


class TransactionsQuery(graphene.ObjectType):
    transaction = graphene.relay.NodeField(TransactionNode)
    transactions = OwnedFilterConnectionField(
        TransactionNode,
        filterset_class=TransactionFilter,
    )

    class Meta:
        abstract = True
