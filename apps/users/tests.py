
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from apps.core.tests import SWTestCase
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory

from .factories import UserFactory


class UsersTestCase(SWTestCase):
    def test_safe_to_spend(self):
        owner = UserFactory.create(estimated_income=2000)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('safeToSpend' in result.data['viewer'])
        self.assertEqual(result.data['viewer']['safeToSpend'], 2000)

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(result.data['viewer']['safeToSpend'], 1400)

    def test_income(self):
        owner = UserFactory.create(estimated_income=2000)
        now = timezone.now()

        result = self.graph_query(
            '{{ viewer {{ income(month: "{}/{}") }} }}'.format(now.year, now.month),
            user=owner,
        )

        self.assertTrue('viewer' in result.data)
        self.assertTrue('income' in result.data['viewer'])

        self.assertEqual(
            result.data['viewer']['income'],
            2000,
            msg='Should return estimate for current month with no incoming transactions'
        )

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=4000, account=account, owner=owner)

        result = self.graph_query(
            '{{ viewer {{ income(month: "{}/{}") }} }}'.format(now.year, now.month),
            user=owner,
        )

        self.assertEqual(
            result.data['viewer']['income'],
            4000,
            msg='Should return transaction-based number',
        )

        a_month_ago = now - relativedelta(months=1)

        TransactionFactory.create(
            amount=1000,
            date=a_month_ago,
            account=account,
            owner=owner,
        )

        result = self.graph_query(
            '{{ viewer {{ income(month: "{}/{}") }} }}'.format(
                a_month_ago.year,
                a_month_ago.month,
            ),
            user=owner,
        )

        self.assertEqual(
            result.data['viewer']['income'],
            1000,
            msg='Should return transaction-based number for old months',
        )
