
import graphene
from graphene.utils import to_snake_case
from graphene.contrib.django.types import DjangoNode
from graphene.contrib.django.fields import DjangoConnectionField
from django.conf import settings

from .client import Finicity
from .models import FinicityInstitution


class FinicityLoginField(graphene.ObjectType):
    id = graphene.String()
    name = graphene.String()
    value = graphene.String()
    description = graphene.String()
    display_order = graphene.String()
    mask = graphene.String()
    value_length_min = graphene.String()
    value_length_max = graphene.String()
    instructions = graphene.String()

    def __init__(self, *args, **kwargs):
        self.finicity = kwargs.pop('finicity')

        kwargs = {to_snake_case(k): v for k, v in kwargs.items()}
        super(FinicityLoginField, self).__init__(*args, **kwargs)


class FinicityInstitutionNode(DjangoNode):
    login_form = graphene.List(FinicityLoginField)
    image = graphene.String()

    class Meta:
        model = FinicityInstitution

    def resolve_login_form(self, args, info):
        finicity_client = Finicity(info.request_context.user)

        return [
            FinicityLoginField(finicity=self, **field)
            for field in finicity_client.get_login_form(self.finicity_id)
        ]

    def resolve_image(self, args, info):
        return self.instance.image.url


class FinicityQuery(graphene.ObjectType):
    finicity_institution = graphene.relay.NodeField(FinicityInstitutionNode)
    finicity_institutions = DjangoConnectionField(
        FinicityInstitutionNode,
        query=graphene.String(),
    )

    class Meta:
        abstract = True

    def resolve_finicity_institutions(self, args, info):
        query = args.get('query')

        if not query:
            return []

        return FinicityInstitution.objects.filter(name__icontains=query)
