from decimal import Decimal

from apps.core.tests import SWTestCase
from apps.core.utils import node_id_from_instance
from apps.users.factories import UserFactory
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory

from .models import Account


class EnableDisableMutationsTestCase(SWTestCase):
    '''
    Tests which check for balance in accounts based on the disabled boolean in the accounts model.
    Each enableAccount or disableAccount mutation changes the disabled boolean.
    Additionally, tests for transactions being added to an enabled account,
    and transactions being deleted after an account is disabled.
    '''

    # GraphQL string input for querying accounts. Stored for readability and repeated use.
    accounts_graph_query = '''{
        viewer {
            accounts {
                edges {
                    node {
                        id
                        currentBalance
                        disabled
                    }
                }
            }
        }
    }'''

    def enabled_accounts_total(self, accounts_JSON):
        'Returns the total current balance from activated accounts, based on the disabled flag.'

        total = 0

        for account in accounts_JSON:
            if not account['node']['disabled']:
                total += account['node']['currentBalance']

        return total

    def test_enable_mutation_balance_and_transactions(self):
        '''
        Creates disabled accounts with different current_balance values, and enables them
        individually to check if the total current_balance changes as expected.
        Additionally, tests for change in the disabled flag after a deactivated account
        is enabled. This checks for the ability to add transactions to an enabled account.
        '''

        owner = UserFactory.create()
        account_1 = AccountFactory.create(owner=owner, disabled=True, current_balance=Decimal(100))
        account_2 = AccountFactory.create(owner=owner, disabled=True, current_balance=Decimal(200))

        # Check if total current_balance  is 0 when both accounts disabled.
        result = self.graph_query(
            self.accounts_graph_query,
            user=owner,
        ).data['viewer']['accounts']['edges']

        self.assertTrue(self.enabled_accounts_total(result) == 0)

        self.graph_query(
            '''
            mutation enableFirstAccount($input: EnableAccountMutationInput!) {
                enableAccount(input: $input) {
                    clientMutationId,
                    account {
                        id,
                        disabled,
                        currentBalance,
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '12345',
                    'accountId': node_id_from_instance(account_1),
                    'sync': True,
                },
            },
            user=owner,
        )

        # Check if total current_balance  is 100 after account_1 is disabled.
        result = self.graph_query(
            self.accounts_graph_query,
            user=owner,
        ).data['viewer']['accounts']['edges']

        self.assertTrue(self.enabled_accounts_total(result) == 10000)

        # Check if mutation is reflected in database by doing a database query.
        account_1 = Account.objects.get(current_balance=100)
        self.assertFalse(account_1.disabled)

        self.graph_query(
            '''
            mutation enableSecondAccount($input: EnableAccountMutationInput!) {
                enableAccount(input: $input) {
                    clientMutationId,
                    account {
                        id,
                        disabled,
                        currentBalance,
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '12345',
                    'accountId': node_id_from_instance(account_2),
                    'sync': True,
                },
            },
            user=owner,
        )

        # Check if total current_balance is 300 after both accounts are enabled.
        result = self.graph_query(
            self.accounts_graph_query,
            user=owner,
        ).data['viewer']['accounts']['edges']

        self.assertTrue(self.enabled_accounts_total(result) == 30000)

        # Check if mutation is reflected in database by doing a database query.
        account_2 = Account.objects.get(current_balance=200)
        self.assertFalse(account_2.disabled)

    def test_disable_mutation_balance_and_transactions(self):
        '''
        Creates enabled accounts with different current_balance values, and disables them
        individually to check if the total current_balance changes as expected.
        Additionally, confirms transactions connected to account are deleted
        after said account is disabled.
        '''

        owner = UserFactory.create()
        account_1 = AccountFactory.create(owner=owner, current_balance=Decimal(100))
        account_2 = AccountFactory.create(owner=owner, current_balance=Decimal(200))

        self.graph_query(
            '''
            mutation disableFirstAccount($input: DisableAccountMutationInput!) {
                disableAccount(input: $input) {
                    clientMutationId,
                    account {
                        id,
                        disabled,
                        currentBalance,
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '12345',
                    'accountId': node_id_from_instance(account_1),
                    'detectTransfers': True,
                },
            },
            user=owner,
        )

        # Check if current_balance total is 200 after account_1 is disabled.
        result = self.graph_query(
            self.accounts_graph_query,
            user=owner,
        ).data['viewer']['accounts']['edges']

        self.assertTrue(self.enabled_accounts_total(result) == 20000)

        # Check if mutation is reflected in database by doing a database query.
        account_1 = Account.objects.get(current_balance=100)
        self.assertTrue(account_1.disabled)

        self.graph_query(
            '''
            mutation disableSecondAccount($input: DisableAccountMutationInput!) {
                disableAccount(input: $input) {
                    clientMutationId,
                    account {
                        id,
                        disabled,
                        currentBalance,
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '12345',
                    'accountId': node_id_from_instance(account_2),
                    'detectTransfers': True,
                },
            },
            user=owner,
        )

        # Check if current_balance total is 0 after both accounts are disabled.
        result = self.graph_query(
            self.accounts_graph_query,
            user=owner,
        ).data['viewer']['accounts']['edges']

        self.assertTrue(self.enabled_accounts_total(result) == 0)

        # Check if mutation is reflected in database by doing a database query.
        account_2 = Account.objects.get(current_balance=200)
        self.assertTrue(account_2.disabled)

        # Create transaction and link it to account_3 to perform transaction test.
        account_3 = AccountFactory.create(owner=owner, current_balance=300)
        TransactionFactory.create(owner=owner, account=account_3, amount=Decimal(150))

        # GraphQL string input for querying transactions. Stored for readability and repeated use.
        transactions_graph_query = '''{
            viewer {
                transactions {
                    edges {
                        node {
                            id,
                            description,
                            amount,
                        }
                    }
                }
            }
        }'''

        transaction_result = self.graph_query(
            transactions_graph_query,
            user=owner,
        ).data['viewer']['transactions']['edges']

        # Check if singular transaction exists after TransactionFactory.create().
        self.assertTrue(len(transaction_result) == 1)
        self.assertTrue(transaction_result[0]['node']['amount'] == 15000)

        # Mutation to disable account.
        self.graph_query(
            '''
            mutation disableFirstAccount($input: DisableAccountMutationInput!) {
                disableAccount(input: $input) {
                    clientMutationId,
                    account {
                        id,
                        disabled,
                        currentBalance,
                    }
                }
            }
            ''',
            variable_values={
                'input': {
                    'clientMutationId': '12345',
                    'accountId': node_id_from_instance(account_3),
                    'detectTransfers': True,
                },
            },
            user=owner,
        )

        transaction_result = self.graph_query(
            transactions_graph_query,
            user=owner,
        ).data['viewer']['transactions']['edges']

        # Check that there are no transactions using GraphQL after connected account.
        self.assertTrue(len(transaction_result) == 0)

        # Check if disableAccount mutation is reflected in database by doing a database query.
        account_3 = Account.objects.get(current_balance=300)
        self.assertTrue(account_3.disabled)
