
import graphene
from graphene.relay import ClientIDMutation

from apps.core.types import Money


class SetIncomeEstimateMutation(ClientIDMutation):
    class Input:
        amount = graphene.InputField(Money())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        info.request_context.user.estimated_income = input['amount']
        info.request_context.user.save()

        return Cls(viewer=Viewer())


class UsersMutations(graphene.ObjectType):
    set_income_estimate = graphene.Field(SetIncomeEstimateMutation)

    class Meta:
        abstract = True
