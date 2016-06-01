
import graphene
from graphene.relay.types import Edge

from apps.core.utils import instance_for_node_id
from .schema import AccountNode


AccountEdge = Edge.for_node(AccountNode)


class DisableAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()
        detect_transfers = graphene.Boolean()

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'), info)
        account.disable(input.get('detect_transfers', True))
        return DisableAccountMutation(account=account)


class EnableAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()
        sync = graphene.Boolean()

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'), info)
        account.enable(input.get('sync', True))
        return EnableAccountMutation(account=account)


class AccountsMutations(graphene.ObjectType):
    disable_account = graphene.Field(DisableAccountMutation)
    enable_account = graphene.Field(EnableAccountMutation)

    class Meta:
        abstract = True
