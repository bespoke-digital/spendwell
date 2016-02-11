
import graphene
from graphene.relay import ClientIDMutation

from apps.core.types import Month
from .models import BucketMonth


class AssignTransactionsMutation(ClientIDMutation):
    class Input:
        month = graphene.InputField(Month())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer
        BucketMonth.objects.assign_transactions(
            owner=info.request_context.user,
            month_start=input['month'],
        )
        return Cls(viewer=Viewer())


class BucketsMutations(graphene.ObjectType):
    assign_transactions = graphene.Field(AssignTransactionsMutation)

    class Meta:
        abstract = True
