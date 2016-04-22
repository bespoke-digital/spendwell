
import graphene

from apps.core.fields import SWNode, SWFilterConnectionField
from apps.core.types import Money
from apps.accounts.schema import AccountNode
from apps.accounts.filters import AccountFilter

from .models import Institution


class InstitutionNode(SWNode):
    can_sync = graphene.Field(graphene.Boolean())
    current_balance = graphene.Field(Money)
    accounts = SWFilterConnectionField(AccountNode, filterset_class=AccountFilter)

    class Meta:
        model = Institution
        filter_order_by = ('name',)
        filter_fields = ('reauth_required',)
        only_fields = (
            'name',
            'accounts',
            'can_sync',
            'last_sync',
            'current_balance',
            'reauth_required',
            'plaid_id',
            'finicity_id',
        )

    def resolve_can_sync(self, args, info):
        return bool(self.instance.plaid_id) or bool(self.instance.finicity_id)


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = SWFilterConnectionField(InstitutionNode)

    class Meta:
        abstract = True
