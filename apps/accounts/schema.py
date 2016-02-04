
import graphene

from apps.core.schema import OwnedNode, OwnedConnectionField
from .models import Account


class AccountNode(OwnedNode):
    class Meta:
        model = Account
        filter_order_by = ['name']


class AccountsQuery(graphene.ObjectType):
    account = graphene.relay.NodeField(AccountNode)
    accounts = OwnedConnectionField(AccountNode)

    class Meta:
        abstract = True
