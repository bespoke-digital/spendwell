
from django.utils import timezone
from dateutil.relativedelta import relativedelta

from apps.core.tests import SWTestCase
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory

from .factories import UserFactory


class UsersTestCase(SWTestCase):
    def test_safe_to_spend(self):
        owner = UserFactory.create()

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('safeToSpend' in result.data['viewer'])
        self.assertEqual(result.data['viewer']['safeToSpend'], 0)

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=2000, account=account, owner=owner)

        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(result.data['viewer']['safeToSpend'], 1400)

    def test_income(self):
        owner = UserFactory.create()
        now = timezone.now()
        query = '{{ viewer {{ income(month: "{}/{}") }} }}'.format(
            now.year,
            now.month,
        )

        result = self.graph_query(query, user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('income' in result.data['viewer'])
        self.assertEqual(result.data['viewer']['income'], 0)

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=2000, account=account, owner=owner)

        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)

        result = self.graph_query(query, user=owner)

        self.assertEqual(result.data['viewer']['income'], 2000)

        for month in range(3):
            TransactionFactory.create(
                amount=1000,
                date=now - relativedelta(months=month + 1),
                account=account,
                owner=owner,
            )

        result = self.graph_query(query, user=owner)

        self.assertEqual(result.data['viewer']['income'], 1000)
