
import graphene

from .models import Institution
from .schema import InstitutionNode


class AddInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()

    institution = graphene.Field(InstitutionNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        return AddInstitutionMutation(
            institution=Institution.objects.create(
                owner=info.request_context.user,
                name=input['name'],
            ),
        )


class InstitutionsMutations(graphene.ObjectType):
    add_institution = graphene.Field(AddInstitutionMutation)

    class Meta:
        abstract = True
