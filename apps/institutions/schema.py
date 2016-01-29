
import graphene
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode

from .models import Institution


class InstitutionNode(DjangoNode):
    class Meta:
        model = Institution
        filter_order_by = ['name']


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = DjangoFilterConnectionField(InstitutionNode)

    class Meta:
        abstract = True
