
import graphene

from apps.core.fields import SWNode, SWConnectionField
from apps.core.types import Money
from .models import Account


class AccountNode(SWNode):
    current_balance = graphene.Field(Money)
    available_balance = graphene.Field(Money)

    class Meta:
        model = Account
        filter_order_by = ['name']
        only_fields = (
            'name',
            'type',
            'subtype',
            'current_balance',
            'available_balance',
            'number_snippet',
            'transactions',
            'disabled',
        )


class AccountsQuery(graphene.ObjectType):
    account = graphene.relay.NodeField(AccountNode)
    accounts = SWConnectionField(AccountNode)

    class Meta:
        abstract = True
