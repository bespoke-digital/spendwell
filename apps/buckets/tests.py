
from apps.core.tests import SWTestCase
from apps.transactions.factories import TransactionFactory
from apps.users.factories import UserFactory

from .factories import BucketFactory
from .models import BucketMonth


class BucktsTestCase(SWTestCase):
    def test_transaction_assignment(self):
        owner = UserFactory.create()

        bucket = BucketFactory.create(
            owner=owner,
            filters=[{'description': 'desc'}],
        )
        BucketMonth.objects.generate(bucket)

        transaction = TransactionFactory.create(
            description='Description',
            owner=owner,
        )

        self.assertEqual(transaction.bucket_months.count(), 0)

        bucket.months.first().assign_transactions()

        self.assertEqual(transaction.bucket_months.count(), 1)
        self.assertEqual(transaction.bucket_months.all()[0].bucket, bucket)

        transaction2 = TransactionFactory.create(
            description='this doesnt work',
            owner=owner,
        )

        bucket.months.first().assign_transactions()

        self.assertEqual(transaction2.bucket_months.count(), 0)
