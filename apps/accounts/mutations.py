
import graphene

from apps.core.utils import instance_for_node_id
from .models import Account
from .schema import AccountNode


class AddAccountMutation(graphene.relay.ClientIDMutation):
    class Input:
        institution_id = graphene.ID()
        name = graphene.String()

    account = graphene.Field(AccountNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        return AddAccountMutation(
            account=Account.objects.create(
                owner=info.request_context.user,
                institution=instance_for_node_id(input.get('institution_id')),
                name=input['name'],
            ),
        )


class AccountsMutations(graphene.ObjectType):
    add_account = graphene.Field(AddAccountMutation)

    class Meta:
        abstract = True
