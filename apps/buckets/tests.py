
from apps.core.tests import SWTestCase
from apps.transactions.factories import TransactionFactory
from apps.users.factories import UserFactory

from .factories import BucketFactory, BucketMonthFactory


class BucktsTestCase(SWTestCase):
    def test_transaction_assignment(self):
        owner = UserFactory.create()

        bucket = BucketFactory.create(owner=owner, filters=[{'description': 'desc'}])
        BucketMonthFactory.create(bucket=bucket)

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
