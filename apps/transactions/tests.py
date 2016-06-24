
from apps.core.tests import SWTestCase
from apps.core.utils import node_id_from_instance
from apps.users.factories import UserFactory
from apps.buckets.factories import BucketFactory
from apps.buckets.models import Bucket
from apps.accounts.factories import AccountFactory

from .models import Transaction
from .filters import TransactionFilter
from .factories import TransactionFactory


class TransactionsTestCase(SWTestCase):
    def test_transfer_detection(self):
        owner = UserFactory.create()

        transfer_to = TransactionFactory.create(owner=owner, amount=100)
        self.assertIsNone(transfer_to.transfer_pair)

        transfer_from = TransactionFactory.create(owner=owner, amount=-100)
        self.assertIsNone(transfer_from.transfer_pair)

        Transaction.objects.detect_transfers(owner=owner)

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
        TransactionFactory.create(owner=owner, amount=-101).toggle_from_savings()
        TransactionFactory.create(owner=owner, amount=-101).toggle_from_savings()

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

    def test_amount_zero_filter(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=-100)

        result = self.graph_query('''{
            viewer {
                transactions(amountGt: 0) {
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
            10000,
        )

        result = self.graph_query('''{
            viewer {
                transactions(amountLt: 0) {
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
            -10000,
        )

    def test_amount_filter(self):
        owner = UserFactory.create()

        TransactionFactory.create(owner=owner, amount=100)
        TransactionFactory.create(owner=owner, amount=200)

        self.assertEqual(
            TransactionFilter({'amount_gt': 150}).qs.filter(owner=owner).count(),
            1,
        )

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{ amountGt: "15000" }]) {
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
            20000,
        )

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{ amountLt: "15000" }]) {
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
            10000,
        )

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{ amountExact: "20000" }]) {
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
            20000,
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

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{descriptionExact: "qwerty"}]) {
                    edges {
                        node {
                            description
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 1)

        result = self.graph_query('''{
            viewer {
                transactions(filters: [{descriptionContains: "qwerty"}]) {
                    edges {
                        node {
                            amount
                        }
                    }
                }
            }
        }''', user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)

    def test_account_filter(self):
        owner = UserFactory.create()

        account = AccountFactory.create()
        TransactionFactory.create(owner=owner)
        TransactionFactory.create(owner=owner, account=account)
        TransactionFactory.create(owner=owner, account=account)

        result = self.graph_query('''{{
            viewer {{
                transactions(account: "{}") {{
                    edges {{
                        node {{
                            description
                        }}
                    }}
                }}
            }}
        }}'''.format(node_id_from_instance(account)), user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)

    def test_account_filterset(self):
        owner = UserFactory.create()

        account = AccountFactory.create()
        TransactionFactory.create(owner=owner)
        TransactionFactory.create(owner=owner, account=account)
        TransactionFactory.create(owner=owner, account=account)

        result = self.graph_query('''{{
            viewer {{
                transactions(filters: [{{ account: "{}" }}]) {{
                    edges {{
                        node {{
                            description
                        }}
                    }}
                }}
            }}
        }}'''.format(node_id_from_instance(account)), user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)

    def test_account_description_filterset(self):
        owner = UserFactory.create()

        account = AccountFactory.create()
        TransactionFactory.create(owner=owner)
        TransactionFactory.create(owner=owner, account=account)
        TransactionFactory.create(owner=owner, account=account)
        TransactionFactory.create(owner=owner, account=account, description='match 1')
        TransactionFactory.create(owner=owner, account=account, description='match 2')

        result = self.graph_query('''{{
            viewer {{
                transactions(filters: [{{ account: "{}", descriptionContains: "match" }}]) {{
                    edges {{
                        node {{
                            description
                        }}
                    }}
                }}
            }}
        }}'''.format(node_id_from_instance(account)), user=owner)

        self.assertEqual(len(result.data['viewer']['transactions']['edges']), 2)

    def test_quick_add(self):
        owner = UserFactory.create()
        bucket = BucketFactory.create(owner=owner)
        transaction = TransactionFactory.create(owner=owner, amount=-100)

        result = self.graph_query(
            '''
            mutation QuickAdd($input: TransactionQuickAddMutationInput!) {
                transactionQuickAdd(input: $input) {
                    transaction {
                        description

                        buckets {
                            edges {
                                node {
                                    name
                                }
                            }
                        }
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'transactionId': node_id_from_instance(transaction),
                    'bucketId': node_id_from_instance(bucket),
                    'clientMutationId': '1',
                },
            },
            user=owner,
        )

        self.assertEqual(
            result.data['transactionQuickAdd']['transaction']['description'],
            transaction.description,
        )

        bucket = Bucket.objects.get(id=bucket.id)

        self.assertTrue({'description_exact': transaction.description} in bucket.filters)
        self.assertTrue(transaction in bucket.raw_transactions())
        self.assertTrue(bucket in transaction.buckets.all())
        self.assertEqual(
            len(result.data['transactionQuickAdd']['transaction']['buckets']['edges']),
            1,
        )
