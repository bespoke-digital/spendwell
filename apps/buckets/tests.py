
from datetime import timedelta
from dateutil.relativedelta import relativedelta

from apps.core.tests import SWTestCase
from apps.transactions.factories import TransactionFactory
from apps.users.factories import UserFactory

from apps.core.utils import this_month
from .factories import BucketFactory


class BucktsTestCase(SWTestCase):
    def test_transaction_assignment(self):
        owner = UserFactory.create()

        bucket = BucketFactory.create(owner=owner, filters=[{'description_contains': 'desc'}])

        transaction = TransactionFactory.create(
            owner=owner,
            description='Description',
            amount=-100,
        )

        self.assertEqual(transaction.bucket_months.count(), 1)
        self.assertEqual(transaction.bucket_months.all()[0].bucket, bucket)

        transaction2 = TransactionFactory.create(
            owner=owner,
            description='this doesnt work',
            amount=-100,
        )

        self.assertEqual(transaction2.bucket_months.count(), 0)

    def test_filters_query(self):
        owner = UserFactory.create()
        BucketFactory.create(owner=owner, filters=[{'description_contains': 'desc'}])

        result = self.graph_query('''{
            viewer {
             buckets {
                edges {
                    node {
                        filters {
                            descriptionContains
                        }
                    }
                }
             }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['buckets']['edges']), 1)
        self.assertEqual(
            len(result.data['viewer']['buckets']['edges'][0]['node']['filters']),
            1,
        )
        self.assertEqual(
            result.data['viewer']['buckets']['edges'][0]['node']['filters'][0]['descriptionContains'],
            'desc',
        )

    def test_bill_avg(self):
        owner = UserFactory.create()

        bill = BucketFactory.create(
            owner=owner,
            type='bill',
            filters=[{'description_exact': 'phone'}],
        )

        last_month = this_month() - relativedelta(months=1)
        transaction = TransactionFactory.create(
            owner=owner,
            date=last_month + timedelta(days=2),
            amount=-111,
            description='phone'
        )
        self.assertTrue(transaction in bill.transactions())

        transaction = TransactionFactory.create(
            owner=owner,
            date=last_month - timedelta(days=2),
            amount=-111,
            description='phone'
        )
        self.assertTrue(transaction in bill.transactions())

        self.assertEqual(bill.months.first().avg_amount, -111)

    def test_external_accounts(self):
        owner = UserFactory.create()

        account = BucketFactory.create(
            owner=owner,
            type='account',
            filters=[{'description_exact': 'trnsfr'}],
        )

        transaction = TransactionFactory.create(owner=owner, description='trnsfr')
        self.assertTrue(transaction in account.transactions())

        transaction = TransactionFactory.create(owner=owner, description='trnsfr')
        self.assertTrue(transaction in account.transactions())

        transaction = TransactionFactory.create(owner=owner, description='transfer')
        self.assertTrue(transaction not in account.transactions())
