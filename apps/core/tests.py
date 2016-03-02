
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.test.client import RequestFactory
from dateutil.relativedelta import relativedelta
import graphene

from spendwell.schema import schema as default_schema
from apps.users.factories import UserFactory
from apps.transactions.factories import TransactionFactory

from .types import Money
from .utils import months_avg, this_month


class SWTestCase(TestCase):
    def setUp(self):
        self.request_factory = RequestFactory()

    def graph_query(self, query, user=None, assert_errors=True, schema=None):
        if user is None:
            user = UserFactory.create()

        if schema is None:
            schema = default_schema

        request = self.request_factory.post('/graphql')

        request.user = user

        result = schema.execute(query, request_context=request)

        if len(result.errors):
            print('GraphQL Errors:', result.errors)

        if assert_errors:
            self.assertEqual(len(result.errors), 0)

        return result


class TypesTestCase(SWTestCase):
    def test_money(self):
        class TestQuery(graphene.ObjectType):
            money_field = graphene.Field(Money)

            def resolve_money_field(self, args, info):
                return Decimal('22.43')

        schema = graphene.Schema()
        schema.query = TestQuery

        result = self.graph_query('{ moneyField }', schema=schema)

        self.assertEqual(result.data['moneyField'], 2243)

    def test_months_avg(self):
        owner = UserFactory.create()

        now_date = this_month() + timedelta(days=1)

        TransactionFactory.create(
            owner=owner,
            date=now_date - relativedelta(months=1),
            amount=111,
        )
        TransactionFactory.create(
            owner=owner,
            date=now_date - relativedelta(months=2),
            amount=111,
        )
        TransactionFactory.create(
            owner=owner,
            date=now_date - relativedelta(months=3),
            amount=111,
        )

        self.assertEqual(months_avg(owner.transactions.all()), 111)
