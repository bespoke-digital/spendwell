
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


class SettingsMutation(ClientIDMutation):
    class Input:
        dashboard_help = graphene.InputField(graphene.Boolean())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        info.request_context.user.dashboard_help = input.get('dashboard_help', True)
        info.request_context.user.save()

        return Cls(viewer=Viewer())


class UsersMutations(graphene.ObjectType):
    set_income_estimate = graphene.Field(SetIncomeEstimateMutation)
    settings = graphene.Field(SettingsMutation)

    class Meta:
        abstract = True
