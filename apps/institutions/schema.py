
import graphene
from apps.core.fields import SWNode, SWConnectionField

from .models import Institution


class InstitutionNode(SWNode):
    can_sync = graphene.Field(graphene.Boolean())

    class Meta:
        model = Institution
        filter_order_by = ('name',)
        only_fields = (
            'name',
            'accounts',
            'can_sync',
            'last_sync',
        )

    def resolve_can_sync(self, args, info):
        return bool(self.instance.plaid_id)


class InstitutionsQuery(graphene.ObjectType):
    institution = graphene.relay.NodeField(InstitutionNode)
    institutions = SWConnectionField(InstitutionNode)

    class Meta:
        abstract = True