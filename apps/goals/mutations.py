
from decimal import Decimal

import graphene
from graphene.relay.types import Edge

from apps.core.utils import instance_for_node_id
from apps.core.types import Money, Month
from .models import Goal
from .schema import GoalNode


GoalEdge = Edge.for_node(GoalNode)


class CreateGoalMutation(graphene.relay.ClientIDMutation):
    class Input:
        name = graphene.String()
        monthly_amount = graphene.Int()

    viewer = graphene.Field('Viewer')
    goal_edge = graphene.Field(GoalEdge)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        monthly_amount = Decimal(input['monthly_amount']) / Decimal('100')
        if monthly_amount > 0:
            monthly_amount = -monthly_amount

        return CreateGoalMutation(
            viewer=Viewer(),
            goal_edge=GoalEdge(
                cursor='none',
                node=Goal.objects.create(
                    owner=info.request_context.user,
                    name=input['name'],
                    monthly_amount=monthly_amount,
                ),
            ),
        )


class UpdateGoalMutation(graphene.relay.ClientIDMutation):
    class Input:
        goal_id = graphene.ID()
        name = graphene.String()
        monthly_amount = graphene.InputField(Money)

    viewer = graphene.Field('Viewer')
    goal = graphene.Field(GoalNode)

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        goal = instance_for_node_id(input['goal_id'], info)
        goal.monthly_amount = input['monthly_amount']
        goal.name = input['name']
        goal.save()

        return UpdateGoalMutation(goal=goal, viewer=Viewer())


class DeleteGoalMutation(graphene.relay.ClientIDMutation):
    class Input:
        goal_id = graphene.ID()

    viewer = graphene.Field('Viewer')

    @classmethod
    def mutate_and_get_payload(cls, input, info):
        from spendwell.schema import Viewer

        goal = instance_for_node_id(input['goal_id'], info)
        goal.delete()

        return UpdateGoalMutation(viewer=Viewer())


class GenerateGoalMonthMutation(graphene.relay.ClientIDMutation):
    class Input:
        goal_id = graphene.ID()
        month = graphene.InputField(Month)

    viewer = graphene.Field('Viewer')
    goal = graphene.Field(GoalNode)

    @classmethod
    def mutate_and_get_payload(Cls, input, info):
        from spendwell.schema import Viewer

        goal = instance_for_node_id(input['goal_id'], info)
        goal.generate_month(month_start=input['month'])

        return Cls(goal=goal, viewer=Viewer())


class GoalsMutations(graphene.ObjectType):
    create_goal = graphene.Field(CreateGoalMutation)
    update_goal = graphene.Field(UpdateGoalMutation)
    delete_goal = graphene.Field(DeleteGoalMutation)
    generate_goal_month = graphene.Field(GenerateGoalMonthMutation)

    class Meta:
        abstract = True
