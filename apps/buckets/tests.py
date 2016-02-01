
from apps.core.tests import SWTestCase
from apps.transactions.factories import TransactionFactory
from apps.users.factories import UserFactory

from .factories import BucketFactory


class BucktsTestCase(SWTestCase):
    def test_transaction_assignment(self):
        owner = UserFactory.create()

        bucket = BucketFactory.create(
            owner=owner,
            filters=[{'type': 'description', 'value': 'desc'}],
        )

        transaction = TransactionFactory.create(
            description='Description',
            owner=owner,
        )

        self.assertIsNone(transaction.bucket)

        owner.buckets.assign(transaction)

        self.assertEqual(transaction.bucket, bucket)

        transaction2 = TransactionFactory.create(
            description='this doesnt work',
            owner=owner,
        )

        owner.buckets.assign(transaction2)

        self.assertIsNone(transaction2.bucket)
