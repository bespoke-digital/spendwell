
import graphene
from graphene.utils import to_snake_case

from apps.core.fields import SWNode, SWConnectionField, SWFilterConnectionField
from apps.core.types import Money
from apps.accounts.schema import AccountNode
from apps.accounts.filters import AccountFilter

from .models import Institution
from .finicity import Finicity


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


class FinicityInstitution(graphene.relay.Node):
    finicity_id = graphene.String()
    name = graphene.String()
    account_type_description = graphene.String()
    url_home_app = graphene.String()
    url_logon_app = graphene.String()
    url_product_app = graphene.String()
    login_form = graphene.List(FinicityLoginField)

    @classmethod
    def get_node(Cls, id, info):
        finicity_client = Finicity(info.request_context.user)
        return Cls(**finicity_client.get_institution(id))

    def __init__(self, *args, **kwargs):
        kwargs = {to_snake_case(k): v for k, v in kwargs.items()}
        self.finicity_id = kwargs.get('id')
        self.finicity = kwargs.pop('finicity')
        super(FinicityInstitution, self).__init__(*args, **kwargs)

    def resolve_login_form(self, args, info):
        return [
            FinicityLoginField(finicity=self, **field)
            for field in self.finicity.get_login_form(self.finicity_id)
        ]


class InstitutionNode(SWNode):
    can_sync = graphene.Field(graphene.Boolean())
    current_balance = graphene.Field(Money)
    accounts = SWFilterConnectionField(AccountNode, filterset_class=AccountFilter)

    class Meta:
        model = Institution
        filter_order_by = ('name',)
        only_fields = (
            'name',
            'accounts',
            'can_sync',
            'last_sync',
            'current_balance',
        )

    def resolve_can_sync(self, args, info):
        return bool(self.instance.plaid_id) or bool(self.instance.finicity_id)


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = SWConnectionField(InstitutionNode)
    finicity_institution = graphene.relay.NodeField(FinicityInstitution)
    finicity_institutions = graphene.relay.ConnectionField(
        FinicityInstitution,
        query=graphene.String(),
    )

    class Meta:
        abstract = True

    def resolve_finicity_institutions(self, args, info):
        finicity_client = Finicity(info.request_context.user)
        return [
            FinicityInstitution(finicity=finicity_client, **data)
            for data in finicity_client.list_institutions(args['query'])
        ]
