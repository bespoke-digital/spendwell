
import graphene
from apps.core.schema import OwnedNode, OwnedConnectionField

from .models import Institution


class InstitutionNode(OwnedNode):
    class Meta:
        model = Institution
        filter_order_by = ('name',)
        filter_fields = ('uploaded',)


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = OwnedConnectionField(InstitutionNode)

    class Meta:
        abstract = True
