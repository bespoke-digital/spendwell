
import graphene
from graphene.utils import to_snake_case

from .client import Finicity


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


def resolve_login_form(node, args, context, info):
    finicity_client = Finicity(context.user)

    return [
        FinicityLoginField(finicity=node, **field)
        for field in finicity_client.get_login_form(node.finicity_id)
    ]
