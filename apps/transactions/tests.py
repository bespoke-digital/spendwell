
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

        self.assertEqual(transfer_to.transfer_pair, transfer_from)
        self.assertEqual(transfer_from.transfer_pair, transfer_to)
        self.assertEqual(Transaction.objects.is_transfer(True).count(), 2)
        self.assertEqual(Transaction.objects.is_transfer(False).count(), 0)

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=100)

        Transaction.objects.detect_transfers(owner=owner)

        self.assertEqual(Transaction.objects.is_transfer(True).count(), 2)
        self.assertEqual(Transaction.objects.is_transfer(False).count(), 4)

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

    def test_amount_filter(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=200)

        result = self.graph_query('''{
            viewer {
                transactions(amountGt: 15000) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 1)
        self.assertEqual(
            result.data['viewer']['transactions']['edges'][0]['node']['amount'],
            -20000,
        )

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{ amountGt: 15000 }]) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 1)
        self.assertEqual(
            result.data['viewer']['transactions']['edges'][0]['node']['amount'],
            -20000,
        )

    def test_description_filter(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, description='qwerty')
        TransactionFactory.create(owner=owner, description='qwertyuiop')
        TransactionFactory.create(owner=owner, description='asdfghjkl')

        result = self.graph_query('''{
            viewer {
                transactions(descriptionExact: "qwerty") {
                    edges {
                        node {
                            description
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 1)
        self.assertEqual(
            result.data['viewer']['transactions']['edges'][0]['node']['description'],
            'qwerty',
        )

        result = self.graph_query('''{
            viewer {
                transactions(descriptionContains: "qwerty") {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)
