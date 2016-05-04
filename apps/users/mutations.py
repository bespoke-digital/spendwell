
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
        info.request_context.user.estimated_income_confirmed = True
        info.request_context.user.save()

        return Cls(viewer=Viewer())


class SettingsMutation(ClientIDMutation):
    class Input:
        dashboard_help = graphene.InputField(graphene.Boolean())
        create_label_help = graphene.InputField(graphene.Boolean())
        create_bill_help = graphene.InputField(graphene.Boolean())
        create_goal_help = graphene.InputField(graphene.Boolean())

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        if 'dashboard_help' in input:
            info.request_context.user.dashboard_help = input['dashboard_help']

        if 'create_label_help' in input:
            info.request_context.user.create_label_help = input['create_label_help']

        if 'create_bill_help' in input:
            info.request_context.user.create_bill_help = input['create_bill_help']

        if 'create_goal_help' in input:
            info.request_context.user.create_goal_help = input['create_goal_help']

        info.request_context.user.save()

        return Cls(viewer=Viewer())


class UsersMutations(graphene.ObjectType):
    set_income_estimate = graphene.Field(SetIncomeEstimateMutation)
    settings = graphene.Field(SettingsMutation)

    class Meta:
        abstract = True
