
import graphene
from graphene.relay.types import Edge

from apps.core.utils import instance_for_node_id
from apps.institutions.schema import InstitutionNode
from .models import Account
from .schema import AccountNode


AccountEdge = Edge.for_node(AccountNode)


class CreateAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        institution_id = graphene.ID()
        name = graphene.String()

    institution = graphene.Field(InstitutionNode)
    account_edge = graphene.Field(AccountEdge)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = Account.objects.create(
            owner=info.request_context.user,
            institution=instance_for_node_id(input.get('institution_id'), info),
            name=input['name'],
        )
        return CreateAccountMutation(
            institution=account.institution,
            account_edge=AccountEdge(cursor='fake', node=account)
        )


class DisableAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'), info)
        account.disable()
        return DisableAccountMutation(account=account)


class EnableAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        account_id = graphene.ID()

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        account = instance_for_node_id(input.get('account_id'), info)
        account.enable()
        return EnableAccountMutation(account=account)


class AccountsMutations(graphene.ObjectType):
    create_account = graphene.Field(CreateAccountMutation)
    disable_account = graphene.Field(DisableAccountMutation)
    enable_account = graphene.Field(EnableAccountMutation)

    class Meta:
        abstract = True
