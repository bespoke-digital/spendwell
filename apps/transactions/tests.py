
from apps.core.tests import SWTestCase
from apps.users.factories import UserFactory

from .models import Transaction
from .factories import TransactionFactory


class BucktsTestCase(SWTestCase):
    def test_transfer_detection(self):
        owner = UserFactory.create()

        transaction1 = TransactionFactory.create(owner=owner, amount=100)

        self.assertIsNone(transaction1.transfer_pair)

        transaction2 = TransactionFactory.create(owner=owner, amount=-100)
        Transaction.objects.detect_transfers(owner=owner)

        transaction2 = Transaction.objects.get(id=transaction2.id)
        transaction1 = Transaction.objects.get(id=transaction1.id)

        self.assertEqual(transaction1.transfer_pair, transaction2)
        self.assertEqual(transaction2.transfer_pair, transaction1)
