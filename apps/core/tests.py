
from django.test import TestCase
from django.test.client import RequestFactory

from spendwell.schema import schema
from apps.users.factories import UserFactory


class SWTestCase(TestCase):
    def setUp(self):
        self.request_factory = RequestFactory()

    def graph_query(self, query, user=None, assert_errors=True):
        request = self.request_factory.post('/graphql')

        if user is None:
            user = UserFactory.create()

        request.user = user

        result = schema.execute(query, request_context=request)

        if len(result.errors):
            print('GraphQL Errors:', result.errors)

        if assert_errors:
            self.assertEqual(len(result.errors), 0)

        return result
