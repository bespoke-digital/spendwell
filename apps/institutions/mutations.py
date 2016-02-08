
import graphene
from graphene.relay.types import Edge

from .models import Institution
from .schema import InstitutionNode


InstitutionEdge = Edge.for_node(InstitutionNode)


class AddInstitutionMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()

    viewer = graphene.Field('Viewer')
    institution_edge = graphene.Field(InstitutionEdge)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        return AddInstitutionMutation(
            viewer={},
            institution_edge=InstitutionEdge(
                cursor='none',
                node=Institution.objects.create(
                    owner=info.request_context.user,
                    name=input['name'],
                ),
            ),
        )


class InstitutionsMutations(graphene.ObjectType):
    add_institution = graphene.Field(AddInstitutionMutation)

    class Meta:
        abstract = True
