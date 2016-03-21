
import json
import graphene

from apps.core.fields import SWNode, SWConnectionField, SWFilterConnectionField
from apps.core.types import Money
from apps.accounts.schema import AccountNode
from apps.accounts.filters import AccountFilter

from .models import Institution
from .finicity import Finicity, FinicityInstitution, FinicityAccount


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
        return bool(self.instance.plaid_id)


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = SWConnectionField(InstitutionNode)
    finicity_institution = graphene.relay.NodeField(FinicityInstitution)
    finicity_institutions = graphene.relay.ConnectionField(
        FinicityInstitution,
        query=graphene.String(),
    )
    finicity_accounts = graphene.Field(
        graphene.List(FinicityAccount),
        credentials=graphene.String(),
        institution_id=graphene.String(),
    )

    class Meta:
        abstract = True

    def resolve_finicity_institutions(self, args, info):
        return Finicity(info.request_context.user).list_institutions(args['query'])

    def resolve_finicity_accounts(self, args, info):
        return Finicity(info.request_context.user).list_accounts(
            args['institution_id'],
            json.loads(args['credentials']),
        )
