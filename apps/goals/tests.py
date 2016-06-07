from decimal import Decimal

from apps.core.tests import SWTestCase
from apps.core.utils import node_id_from_instance
from apps.goals.factories import GoalFactory
from apps.users.factories import UserFactory

from .models import Goal


class GoalsTestCase(SWTestCase):
    goal_graph_query = '''{
            viewer {
                goals {
                    edges {
                        node {
                            id,
                            monthlyAmount,
                            name,
                        }
                    }
                }
            }
    }'''

    def test_creating_goals(self):

        owner = UserFactory.create()

        # Checking create goal here
        result = self.graph_query(
            '''
                mutation ($input: CreateGoalMutationInput!){
                    createGoal(input: $input){
                        clientMutationId,
                    }
                }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '123',
                    'name': 'Spend-Very Well',
                    'monthlyAmount': 500
                }
            },
            user=owner,
        )
        # Checks the number of goals created
        self.assertEqual(len(result.data['createGoal']), 1)
        # Validates clientMutationId of the goal
        self.assertEqual(result.data['createGoal']['clientMutationId'], '123')
        self.assertTrue('createGoal' in result.data)
        self.assertTrue('clientMutationId' in result.data['createGoal'])
        result = self.graph_query(
            self.goal_graph_query,
            user=owner,
        )

        self.assertEqual(
            len(result.data['viewer']['goals']['edges']),
            1,
        )
        # checking key and values specifics using GraphQl
        self.assertTrue('viewer' in result.data)
        self.assertTrue('goals' in result.data['viewer'])
        self.assertTrue('edges' in result.data['viewer']['goals'])
        self.assertTrue('node' in result.data['viewer']['goals']['edges'][0])
        self.assertTrue(
            'id' in result.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertTrue(
            'monthlyAmount'
            in
            result.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertEqual(
            result.data['viewer']['goals']['edges'][0]['node']['monthlyAmount'],
            -500,
        )
        self.assertTrue(
            'name' in result.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertEqual(
            result.data['viewer']['goals']['edges'][0]['node']['name'],
            'Spend-Very Well',
        )

        # checking value specs form DB
        goal = Goal.objects.get(name='Spend-Very Well')
        self.assertEqual(goal.monthly_amount, -5)
        goal_numbers = Goal.objects.all()
        self.assertTrue(len(goal_numbers) == 1)

    def test_updating_goals(self):
        owner = UserFactory.create()

        goal = GoalFactory.create(monthly_amount=Decimal('-500'), owner=owner)

        # Checking updating goal Graphiql specs here
        result = self.graph_query(
            '''
            mutation ($input: UpdateGoalMutationInput!){
                updateGoal(input: $input){
                    clientMutationId,
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': 'abcd123',
                    'goalId': node_id_from_instance(goal),
                    'name': 'SpendIt-Very Well',
                    'monthlyAmount': -1000,
                }
            },
            user=owner,
        )
        result_for_db = self.graph_query(
            self.goal_graph_query,
            user=owner,
        )
        # Checks the number of Goals updated here
        self.assertEqual(len(result.data['updateGoal']), 1)
        # Validates clientMutationId of the goal
        self.assertEqual(
            result.data['updateGoal']['clientMutationId'],
            'abcd123'
        )
        self.assertTrue('updateGoal' in result.data)
        self.assertTrue('clientMutationId' in result.data['updateGoal'])

        self.assertEqual(
            len(result_for_db.data['viewer']['goals']['edges']),
            1,
        )
        # checking key and values specifics using GraphQl
        self.assertTrue('viewer' in result_for_db.data)
        self.assertTrue('goals' in result_for_db.data['viewer'])
        self.assertTrue('edges' in result_for_db.data['viewer']['goals'])
        self.assertTrue(
            'node'
            in
            result_for_db.data['viewer']['goals']['edges'][0]
        )
        self.assertTrue(
            'id'
            in
            result_for_db.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertTrue(
            'monthlyAmount'
            in
            result_for_db.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertEqual(
            result_for_db.data['viewer']['goals']['edges'][0]['node']['monthlyAmount'],
            -1000,
        )
        self.assertTrue(
            'name'
            in
            result_for_db.data['viewer']['goals']['edges'][0]['node']
        )
        self.assertEqual(
            result_for_db.data['viewer']['goals']['edges'][0]['node']['name'],
            'SpendIt-Very Well',
        )

        # checking value specs form DB
        goal = Goal.objects.get(name='SpendIt-Very Well')
        self.assertEqual(goal.monthly_amount, -10)
        goal_numbers = Goal.objects.all()
        self.assertEqual(len(goal_numbers), 1)

    def test_deleting_goals(self):
        owner = UserFactory.create()

        goal = GoalFactory.create(monthly_amount=Decimal('-750'), owner=owner)

        # Checking deleting goal Graphiql specs here
        result = self.graph_query(
            '''
            mutation ($input: DeleteGoalMutationInput!){
                deleteGoal(input: $input){
                    clientMutationId,
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': 'ABCDabcd123',
                    'goalId': node_id_from_instance(goal),
                }
            },
            user=owner,
        )
        result_for_db = self.graph_query(
            self.goal_graph_query,
            user=owner,
        )
        # Checks the number of Goals deleted here
        self.assertEqual(len(result.data['deleteGoal']), 1)
        # Validates clientMutationId of the goal
        self.assertEqual(
            result.data['deleteGoal']['clientMutationId'],
            'ABCDabcd123'
        )

        # checking key and values specifics using GraphQl
        self.assertTrue('deleteGoal' in result.data)
        self.assertTrue('clientMutationId' in result.data['deleteGoal'])

        self.assertEqual(
            len(result_for_db.data['viewer']['goals']['edges']),
            0,
        )
        self.assertTrue('viewer' in result_for_db.data)
        self.assertTrue('goals' in result_for_db.data['viewer'])
        self.assertTrue('edges' in result_for_db.data['viewer']['goals'])

        # checking value specs form DB
        goal = Goal.objects.all()
        self.assertEqual(len(goal), 0)
