from django.test import TestCase
from decimal import Decimal

from apps.core.tests import SWTestCase
from apps.core.utils import node_id_from_instance
from apps.users.factories import UserFactory
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory

from .models import Account

class EnableDisableFlagsTestCase(SWTestCase):
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

	def enabled_accounts_total(self, accounts_JSON ):
			total = 0

			for account in accounts_JSON:
				if account['node']['disabled'] == False:
					total += account['node']['currentBalance']

			return total

	def test_flags_and_balance_enabled_accounts(self):
		owner = UserFactory.create()
		AccountFactory.create(owner=owner, current_balance=Decimal(100))
		AccountFactory.create(owner=owner, current_balance=Decimal(200))

		result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
		self.assertTrue(self.enabled_accounts_total(result) == 30000)

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

		result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
		self.assertTrue(self.enabled_accounts_total(result) == 20000)

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

		result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
		self.assertTrue(self.enabled_accounts_total(result) == 0)

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

		result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
		self.assertTrue(self.enabled_accounts_total(result) == 10000)

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

		result = self.graph_query(self.accounts_graph_query, user=owner).data['viewer']['accounts']['edges']
		self.assertTrue(self.enabled_accounts_total(result) == 30000)

		account_2 = Account.objects.get(current_balance=200)
		self.assertTrue(account_1.disabled == False)

class EnableDisableAccountsTransactionsTestCase(SWTestCase):
	def test_accounts_transactions_after_enable_and_disable(self):
		owner = UserFactory.create()
		account = AccountFactory.create(owner=owner)
		transaction = TransactionFactory.create(owner=owner, account=account, description="t1 1", amount=Decimal(150))

		result = self.graph_query('''{
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
		}''', user=owner)

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

		self.assertTrue(len(transaction_result) == 1)
		self.assertTrue(transaction_result[0]['node']['amount'] == 15000)

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

		self.assertTrue(len(transaction_result) == 0)

		account = Account.objects.get(owner=owner)
		self.assertTrue(account.disabled == True)		