
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from dateutil.relativedelta import relativedelta
import delorean

from apps.core.tests import SWTestCase
from apps.core.utils import this_month
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory
from apps.buckets.factories import BucketFactory

from .factories import UserFactory
from .summary import MonthSummary


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
        query = '{{ viewer {{ summary(month: "{}/{}") {{ income, incomeEstimated }} }} }}'

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('summary' in result.data['viewer'])
        self.assertTrue('income' in result.data['viewer']['summary'])

        self.assertTrue(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should be estimated'
        )

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            200000,
            msg='Should return estimate for current month with no incoming transactions'
        )

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=Decimal('4000'), account=account, owner=owner)

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertFalse(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should not be estimated'
        )

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

        self.assertFalse(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should not be estimated'
        )

    def test_summary_goals(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        BucketFactory.create(type='goal', fixed_goal_amount=Decimal('-500'), owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(
            result.data['viewer']['safeToSpend'],
            150000,
            msg='Should return estimate for current month minus the goal amount'
        )

    def test_summary_goal_months(self):
        current_month_start = delorean.now().truncate('month').datetime
        owner = UserFactory.create(estimated_income=Decimal('2000'))
        query = '''{{
            viewer {{
                summary(month: "{month:%Y/%m}") {{
                    allocated
                    bucketMonths(first: 10) {{
                        edges {{
                            node {{
                                id
                            }}
                        }}
                    }}
                }}
            }}
        }}'''

        result = self.graph_query(query.format(month=current_month_start), user=owner)
        self.assertEqual(result.data['viewer']['summary']['allocated'], 0)
        self.assertEqual(len(result.data['viewer']['summary']['bucketMonths']['edges']), 0)

        BucketFactory.create(type='goal', fixed_goal_amount=Decimal('-500'), owner=owner)

        result = self.graph_query(query.format(month=current_month_start), user=owner)
        self.assertEqual(result.data['viewer']['summary']['allocated'], -50000)
        self.assertEqual(len(result.data['viewer']['summary']['bucketMonths']['edges']), 1)

    def test_summary_bills(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        last_month = this_month() - relativedelta(months=1)
        TransactionFactory.create(
            owner=owner,
            date=last_month + timedelta(days=2),
            amount=-111,
            description='phone'
        )
        TransactionFactory.create(
            owner=owner,
            date=last_month - timedelta(days=2),
            amount=-111,
            description='phone'
        )

        bucket = BucketFactory.create(
            owner=owner,
            type='bill',
            filters=[{'description_exact': 'phone'}],
        )
        bucket.assign_transactions()

        self.assertEqual(bucket.transactions.count(), 2)

        summary = MonthSummary(owner)

        self.assertEqual(summary.bills_unpaid_total, -111)

        result = self.graph_query('''{{
            viewer {{
                summary(month: "{month:%Y/%m}") {{
                    allocated
                    spent
                }}
            }}
        }}'''.format(month=this_month()), user=owner)

        self.assertEqual(
            result.data['viewer']['summary']['allocated'],
            -11100,
        )
