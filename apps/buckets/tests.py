
from decimal import Decimal
from datetime import timedelta
from dateutil.relativedelta import relativedelta

from apps.core.tests import SWTestCase
from apps.core.utils import this_month, node_id_from_instance
from apps.transactions.factories import TransactionFactory
from apps.users.factories import UserFactory
from apps.accounts.factories import AccountFactory

from .factories import BucketFactory
from .models import Bucket


class BucktsTestCase(SWTestCase):
    def test_transaction_assignment(self):
        owner = UserFactory.create()

        transaction = TransactionFactory.create(
            owner=owner,
            description='Description',
            amount=-100,
        )

        bucket = BucketFactory.create(owner=owner, filters=[{'description_contains': 'desc'}])

        self.assertEqual(transaction.buckets.count(), 1)
        self.assertEqual(transaction.buckets.first(), bucket)

        transaction2 = TransactionFactory.create(
            owner=owner,
            description='this doesnt work',
            amount=-100,
        )

        self.assertEqual(transaction2.buckets.count(), 0)

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

    def test_filters_account(self):
        owner = UserFactory.create()
        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(owner=owner)
        TransactionFactory.create(owner=owner, account=account)
        TransactionFactory.create(owner=owner, account=account)

        BucketFactory.create(owner=owner, filters=[{
            'account': account.id,
        }])

        result = self.graph_query('''{
            viewer {
                buckets {
                    edges {
                        node {
                            transactions(first: 2) {
                                edges {
                                    node {
                                        id
                                    }
                                }
                            }
                            filters {
                                account
                            }
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['buckets']['edges']), 1)
        self.assertEqual(
            len(result.data['viewer']['buckets']['edges'][0]['node']['transactions']['edges']),
            2,
        )
        self.assertEqual(
            len(result.data['viewer']['buckets']['edges'][0]['node']['filters']),
            1,
        )
        self.assertEqual(
            result.data['viewer']['buckets']['edges'][0]['node']['filters'][0]['account'],
            node_id_from_instance(account),
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
        bill.assign_transactions()
        self.assertTrue(transaction in bill.transactions.all())

        transaction = TransactionFactory.create(
            owner=owner,
            date=last_month - timedelta(days=2),
            amount=-111,
            description='phone'
        )
        bill.assign_transactions()
        self.assertTrue(transaction in bill.transactions.all())

    def test_external_accounts(self):
        owner = UserFactory.create()

        account = BucketFactory.create(
            owner=owner,
            type='account',
            filters=[{'description_exact': 'trnsfr'}],
        )

        transaction = TransactionFactory.create(owner=owner, description='trnsfr')
        account.assign_transactions()
        self.assertTrue(transaction in account.transactions.all())

        transaction = TransactionFactory.create(owner=owner, description='trnsfr')
        account.assign_transactions()
        self.assertTrue(transaction in account.transactions.all())

        transaction = TransactionFactory.create(owner=owner, description='transfer')
        account.assign_transactions()
        self.assertTrue(transaction not in account.transactions.all())

    def test_decimal_filter(self):
        owner = UserFactory.create()

        bucket = BucketFactory.create(
            owner=owner,
            type='account',
            filters=[{'amount_gt': Decimal('25.52')}],
        )

        fetched_bucket = Bucket.objects.get(id=bucket.id)

        self.assertEqual(bucket.filters[0]['amount_gt'], fetched_bucket.filters[0]['amount_gt'])
        self.assertTrue(isinstance(fetched_bucket.filters[0]['amount_gt'], Decimal))
