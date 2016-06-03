from django.test import TestCase
from decimal import Decimal

from apps.core.tests import SWTestCase
from apps.core.utils import node_id_from_instance
from apps.users.factories import UserFactory
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory

from .models import Account

# Series of tests that check for balance in accounts based on the 'disabled' boolean in the accounts model
# Each enableAccount or disableAccount mutation changes the 'disabled' boolean
class EnableDisableFlagsTestCase(SWTestCase):
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

    # Function that returns the total current balance from activated accounts, based on the 'disabled' boolean.
    def enabled_accounts_total(self, accounts_JSON ):
            total = 0

            for account in accounts_JSON:
                if account['node']['disabled'] == False:
                    total += account['node']['currentBalance']

            return total

    # Basic GraphQL query after creating two accounts to see if they exist.
    def test_flags_and_balance_enabled_accounts(self):
        owner = UserFactory.create()
        AccountFactory.create(owner=owner, current_balance=Decimal(100))
        AccountFactory.create(owner=owner, current_balance=Decimal(200))

        result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
        self.assertTrue(self.enabled_accounts_total(result) == 30000)

    # A series of tests to see the change in total current_balance after enabling and disabling two accounts with
    # two different current_balance values.
    def test_flags_and_balance_disabled_accounts(self):
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

        # Check if current_balance total is be 200 after account_1 is disabled.
        result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
        self.assertTrue(self.enabled_accounts_total(result) == 20000)

        # Check if GraphQL mutation is reflected in database by doing a database query.
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

        # Check if current_balance total is be 0 after account_1 and account_2 are disabled.
        result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
        self.assertTrue(self.enabled_accounts_total(result) == 0)

        # Check if GraphQL mutation is reflected in database by doing a database query.
        account_2 = Account.objects.get(current_balance=200)
        self.assertTrue(account_2.disabled)

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

        # Check if current_balance total is be 100 after account_2 is disabled.
        result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
        self.assertTrue(self.enabled_accounts_total(result) == 10000)
        
        # Check if GraphQL mutation is reflected in database by doing a database query.
        account_1 = Account.objects.get(current_balance=100)
        self.assertTrue(account_1.disabled == False)

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

        # Check if current_balance total is 300 after no accounts are disabled. 
        result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
        self.assertTrue(self.enabled_accounts_total(result) == 30000)

        # Check if GraphQL mutation is reflected in database by doing a database query.
        account_2 = Account.objects.get(current_balance=200)
        self.assertTrue(account_1.disabled == False)

# Test to confirm if transactions connected to an account are deleted after said account is disabled. 
class EnableDisableAccountsTransactionsTestCase(SWTestCase):
    def test_accounts_transactions_after_enable_and_disable(self):
        owner = UserFactory.create()
        account = AccountFactory.create(owner=owner)
        transaction = TransactionFactory.create(owner=owner, account=account, description="t1 1", amount=Decimal(150))

        # GraphQL string input for querying transactions. Stored for readability and repeated use.
        transactions_graph_query = '''{
            viewer {
                transactions {
                    edges {
                        node {
                            id,
                            description,
                            amount
                        }
                    }
                }
            }
        }'''

        transaction_result = self.graph_query(transactions_graph_query, user=owner).data['viewer']['transactions']['edges']

        # Confirm if singular transaction exists after TransactionFactory.create().
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
                    'accountId': node_id_from_instance(account),
                    'detectTransfers': True,
                },
            },
            user=owner,
        )

        transaction_result = self.graph_query(transactions_graph_query, user=owner).data['viewer']['transactions']['edges']

        # Confirm that there are no transactions using GraphQL after the account it was connected to is disabled.
        self.assertTrue(len(transaction_result) == 0)

        # Check if GraphQL disableAccount mutation is reflected in database by doing a database query.
        account = Account.objects.get(owner=owner)
        self.assertTrue(account.disabled == True)       