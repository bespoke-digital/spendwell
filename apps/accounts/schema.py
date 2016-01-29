
import graphene
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode

from .models import Account


class AccountNode(DjangoNode):
    class Meta:
        model = Account
        filter_order_by = ['name']


class AccountsQuery(graphene.ObjectType):
    account = graphene.relay.NodeField(AccountNode)
    accounts = DjangoFilterConnectionField(AccountNode)

    class Meta:
        abstract = True
