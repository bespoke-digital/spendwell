
import graphene
from graphene.relay.types import Edge

from apps.core.utils import instance_for_node_id
from apps.institutions.schema import InstitutionNode
from .models import Account
from .schema import AccountNode


AccountEdge = Edge.for_node(AccountNode)


class AddAccountMutation(graphene.relay.ClientIDMutation):
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
        return AddAccountMutation(
            institution=account.institution,
            account_edge=AccountEdge(cursor='fake', node=account)
        )


class AccountsMutations(graphene.ObjectType):
    add_account = graphene.Field(AddAccountMutation)

    class Meta:
        abstract = True
