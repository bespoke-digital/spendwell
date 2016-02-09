
from decimal import Decimal

from django.utils import timezone
from dateutil.relativedelta import relativedelta

from apps.core.tests import SWTestCase
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory
from apps.goals.factories import GoalFactory

from .factories import UserFactory


class UsersTestCase(SWTestCase):
    def test_safe_to_spend(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('safeToSpend' in result.data['viewer'])
        self.assertEqual(result.data['viewer']['safeToSpend'], 200000)

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(result.data['viewer']['safeToSpend'], 140000)

    def test_month_summary(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))
        now = timezone.now()
        query = '{{ viewer {{ summary(month: "{}/{}") {{ income }} }} }}'

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('summary' in result.data['viewer'])
        self.assertTrue('income' in result.data['viewer']['summary'])

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            200000,
            msg='Should return estimate for current month with no incoming transactions'
        )

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=Decimal('4000'), account=account, owner=owner)

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            400000,
            msg='Should return transaction-based number',
        )

        a_month_ago = now - relativedelta(months=1)

        TransactionFactory.create(
            amount=Decimal('1000'),
            date=a_month_ago,
            account=account,
            owner=owner,
        )

        result = self.graph_query(
            query.format(a_month_ago.year, a_month_ago.month),
            user=owner,
        )

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            100000,
            msg='Should return transaction-based number for old months',
        )

    def test_summary_goals(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        GoalFactory.create(monthly_amount=Decimal('-500'), owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(
            result.data['viewer']['safeToSpend'],
            150000,
            msg='Should return estimate for current month minus the goal amount'
        )
