
from apps.core.tests import SWTestCase
from apps.users.factories import UserFactory

from .models import Transaction
from .factories import TransactionFactory


class BucktsTestCase(SWTestCase):
    def test_transfer_detection(self):
        owner = UserFactory.create()

        transfer_to = TransactionFactory.create(owner=owner, amount=100)
        self.assertIsNone(transfer_to.transfer_pair)

        transfer_from = TransactionFactory.create(owner=owner, amount=-100)
        self.assertIsNone(transfer_from.transfer_pair)

        Transaction.objects.detect_transfers(owner=owner)

        transfer_from.refresh_from_db()
        transfer_to.refresh_from_db()

        self.assertEqual(transfer_to.transfer_pair, transfer_from)
        self.assertEqual(transfer_from.transfer_pair, transfer_to)
        self.assertEqual(Transaction.objects.filter(transfer_pair__isnull=False).count(), 2)
        self.assertEqual(Transaction.objects.filter(transfer_pair__isnull=True).count(), 0)

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)

        Transaction.objects.detect_transfers(owner=owner)

        self.assertEqual(Transaction.objects.filter(transfer_pair__isnull=False).count(), 2)
        self.assertEqual(Transaction.objects.filter(transfer_pair__isnull=True).count(), 4)

    def test_is_transfer_query(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, amount=101)
        TransactionFactory.create(owner=owner, amount=-101)

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)

        Transaction.objects.detect_transfers(owner=owner)

        result = self.graph_query('''{
            viewer {
                transactions(isTransfer: true) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)

        result = self.graph_query('''{
            viewer {
                transactions(isTransfer: false) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 4)

    def test_from_savings_query(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, amount=-100)
        TransactionFactory.create(owner=owner, amount=-100)
        TransactionFactory.create(owner=owner, amount=-101).mark_as_from_savings()
        TransactionFactory.create(owner=owner, amount=-101).mark_as_from_savings()

        result = self.graph_query('''{
            viewer {
                transactions(fromSavings: true) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)
        self.assertEqual(
            result.data['viewer']['transactions']['edges'][0]['node']['amount'],
            -10100,
        )
