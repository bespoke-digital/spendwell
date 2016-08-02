
import json
from datetime import timedelta
from decimal import Decimal

from django.core.signing import Signer
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from dateutil.relativedelta import relativedelta
import delorean

from apps.core.tests import SWTestCase
from apps.core.utils import this_month
from apps.core.views import auth_graphql_view
from apps.accounts.factories import AccountFactory
from apps.transactions.factories import TransactionFactory
from apps.buckets.factories import BucketFactory

from .factories import UserFactory
from .summary import MonthSummary
from .views import token_auth_view


class UsersTestCase(SWTestCase):
    def test_safe_to_spend(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('safeToSpend' in result.data['viewer'])
        self.assertEqual(result.data['viewer']['safeToSpend'], 200000)

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)
        TransactionFactory.create(amount=-200, account=account, owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(result.data['viewer']['safeToSpend'], 140000)

    def test_month_summary(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))
        now = timezone.now()
        query = '{{ viewer {{ summary(month: "{}/{}") {{ income, incomeEstimated }} }} }}'

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertTrue('viewer' in result.data)
        self.assertTrue('summary' in result.data['viewer'])
        self.assertTrue('income' in result.data['viewer']['summary'])

        self.assertTrue(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should be estimated'
        )

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            200000,
            msg='Should return estimate for current month with no incoming transactions'
        )

        account = AccountFactory.create(owner=owner)

        TransactionFactory.create(amount=Decimal('4000'), account=account, owner=owner)

        result = self.graph_query(query.format(now.year, now.month), user=owner)

        self.assertFalse(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should not be estimated'
        )

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            400000,
            msg='Should return transaction-based number',
        )

        a_month_ago = now - relativedelta(months=1)

        TransactionFactory.create(
            amount=Decimal('1000'),
            date=a_month_ago,
            account=account,
            owner=owner,
        )

        result = self.graph_query(
            query.format(a_month_ago.year, a_month_ago.month),
            user=owner,
        )

        self.assertEqual(
            result.data['viewer']['summary']['income'],
            100000,
            msg='Should return transaction-based number for old months',
        )

        self.assertFalse(
            result.data['viewer']['summary']['incomeEstimated'],
            msg='Income should not be estimated'
        )

    def test_summary_fixed_goals(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        BucketFactory.create(type='goal', fixed_goal_amount=Decimal('-500'), owner=owner)

        result = self.graph_query('{ viewer { safeToSpend } }', user=owner)

        self.assertEqual(
            result.data['viewer']['safeToSpend'],
            150000,
            msg='Should return estimate for current month minus the goal amount'
        )

    def test_summary_filtered_goals(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-111'),
            description='match',
            date=this_month() - relativedelta(months=1),
        )
        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-111'),
            description='match',
            date=this_month() - relativedelta(months=2),
        )
        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-111'),
            description='match',
            date=this_month() - relativedelta(months=3),
        )
        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-111'),
            description='mismatch',
            date=this_month() - relativedelta(months=2),
        )

        goal = BucketFactory.create(
            type='goal',
            owner=owner,
            filters=[{'description_exact': 'match'}],
        )
        goal.assign_transactions()

        summary = MonthSummary(owner)

        self.assertEqual(summary.goals_total, Decimal('-111'))

    def test_summary_goal_months(self):
        current_month_start = delorean.now().truncate('month').datetime
        owner = UserFactory.create(estimated_income=Decimal('2000'))
        query = '''{{
            viewer {{
                summary(month: "{month:%Y/%m}") {{
                    allocated
                    bucketMonths(first: 10) {{
                        edges {{
                            node {{
                                id
                            }}
                        }}
                    }}
                }}
            }}
        }}'''

        result = self.graph_query(query.format(month=current_month_start), user=owner)
        self.assertEqual(result.data['viewer']['summary']['allocated'], 0)
        self.assertEqual(len(result.data['viewer']['summary']['bucketMonths']['edges']), 0)

        BucketFactory.create(type='goal', fixed_goal_amount=Decimal('-500'), owner=owner)

        result = self.graph_query(query.format(month=current_month_start), user=owner)
        self.assertEqual(result.data['viewer']['summary']['allocated'], -50000)
        self.assertEqual(len(result.data['viewer']['summary']['bucketMonths']['edges']), 1)

    def test_summary_bills(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        last_month = this_month() - relativedelta(months=1)
        TransactionFactory.create(
            owner=owner,
            date=last_month + timedelta(days=2),
            amount=-111,
            description='phone'
        )
        TransactionFactory.create(
            owner=owner,
            date=last_month - timedelta(days=2),
            amount=-111,
            description='phone'
        )

        bucket = BucketFactory.create(
            owner=owner,
            type='bill',
            filters=[{'description_exact': 'phone'}],
        )
        bucket.assign_transactions()

        self.assertEqual(bucket.transactions.count(), 2)

        summary = MonthSummary(owner)

        self.assertEqual(summary.bills_unpaid_total, -111)

        result = self.graph_query('''{{
            viewer {{
                summary(month: "{month:%Y/%m}") {{
                    allocated
                    spent
                }}
            }}
        }}'''.format(month=this_month()), user=owner)

        self.assertEqual(
            result.data['viewer']['summary']['allocated'],
            -11100,
        )

    def test_bucket_months(self):
        owner = UserFactory.create(estimated_income=Decimal('2000'))

        one_month_ago = timezone.now() - relativedelta(months=1)
        two_month_ago = timezone.now() - relativedelta(months=2)
        three_month_ago = timezone.now() - relativedelta(months=3)

        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-234'),
            description='phone',
            date=one_month_ago,
        )
        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-234'),
            description='phone',
            date=two_month_ago,
        )
        TransactionFactory.create(
            owner=owner,
            amount=Decimal('-234'),
            description='phone',
            date=three_month_ago,
        )
        TransactionFactory.create(owner=owner, amount=Decimal('-151'), description='phone')
        TransactionFactory.create(owner=owner, amount=Decimal('-111'), description='phone')
        TransactionFactory.create(owner=owner, amount=Decimal('-222'), description='waaa')

        bucket = BucketFactory.create(
            owner=owner,
            type='bill',
            filters=[{'description_exact': 'phone'}],
        )
        bucket.assign_transactions()

        bucket = BucketFactory.create(
            owner=owner,
            type='label',
            filters=[{'description_exact': 'waaa'}],
        )
        bucket.assign_transactions()

        summary = MonthSummary(owner)

        self.assertEqual(len(summary.bucket_months), 2)

        for bucket_month in summary.bucket_months:
            self.assertEqual(bucket_month.month_start, this_month())

            if bucket_month.bucket.type == 'bill':
                self.assertEqual(bucket_month.amount, Decimal('-151') + Decimal('-111'))
                self.assertEqual(bucket_month.avg_amount, Decimal('-234'))

                self.assertEqual(len(bucket_month.transactions), 2)
                for transaction in bucket_month.transactions:
                    self.assertEqual(transaction.description, 'phone')

            else:
                self.assertEqual(bucket_month.amount, Decimal('-222'))
                self.assertEqual(len(bucket_month.transactions), 1)
                self.assertEqual(bucket_month.transactions.first().description, 'waaa')

        result = self.graph_query('''{{
            viewer {{
                summary(month: "{month:%Y/%m}") {{
                    bucketMonths {{
                        edges {{
                            node {{
                                id
                                amount
                                avgAmount

                                bucket {{
                                    type
                                }}

                                transactions(first: 10) {{
                                    edges {{
                                        node {{
                                            description
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}
        }}'''.format(month=this_month()), user=owner)

        self.assertEqual(
            len(result.data['viewer']['summary']['bucketMonths']['edges']),
            2,
        )

        bill_node_id = None

        for edge in result.data['viewer']['summary']['bucketMonths']['edges']:
            if edge['node']['bucket']['type'] == 'bill':
                self.assertEqual(edge['node']['amount'], -15100 + -11100)
                self.assertEqual(edge['node']['avgAmount'], -23400)

                self.assertEqual(len(edge['node']['transactions']['edges']), 2)
                for transaction_edge in edge['node']['transactions']['edges']:
                    self.assertEqual(transaction_edge['node']['description'], 'phone')

                bill_node_id = edge['node']['id']
            else:
                self.assertEqual(edge['node']['amount'], -22200)
                self.assertEqual(len(edge['node']['transactions']['edges']), 1)
                self.assertEqual(edge['node']['transactions']['edges'][0]['node']['description'], 'waaa')

        result = self.graph_query('''
            query {{
                node(id: "{}") {{
                    ...BucketMonthFragment
                }}
            }}
            fragment BucketMonthFragment on BucketMonthNode {{
                id
                avgAmount
            }}
        '''.format(bill_node_id), user=owner)

        self.assertEqual(result.data['node']['id'], bill_node_id)
        self.assertEqual(result.data['node']['avgAmount'], -23400)

    def test_token_auth(self):
        user = UserFactory.create()
        user.set_password('passw0rd')
        user.save()

        request = self.request_factory.post('/graphql')
        request.user = AnonymousUser()
        response = auth_graphql_view(request)
        self.assertEqual(response.status_code, 403)

        request = self.request_factory.post('/graphql')
        request.user = AnonymousUser()
        request.META['HTTP_AUTHORIZATION'] = 'Token badtoken'
        response = auth_graphql_view(request)
        self.assertEqual(response.status_code, 403)

        request = self.request_factory.post(reverse('token-auth'), {
            'username': user.email,
            'password': 'wrongpassword',
            'device_type': 'test',
            'device_name': 'test_token_auth',
        })

        response = token_auth_view(request)

        self.assertEqual(response.status_code, 400)

        request = self.request_factory.post(reverse('token-auth'), {
            'username': user.email,
            'password': 'passw0rd',
            'device_type': 'test',
            'device_name': 'test_token_auth',
        })

        response = token_auth_view(request)
        response_content = json.loads(response.content.decode('utf-8'))

        self.assertEqual(response.status_code, 200)
        self.assertTrue('token' in response_content)

        token = response_content['token']
        signer = Signer()
        user_id, salt = signer.unsign(token).split(':')
        self.assertEqual(user.id, int(user_id))

        request = self.request_factory.post(
            '/graphql',
            content_type='application/json',
            data=json.dumps({
                'query': '{ viewer { dummy } }',
                'variables': {},
            }),
        )
        request.META['HTTP_AUTHORIZATION'] = 'Token {}'.format(token)
        request.user = AnonymousUser()

        response = auth_graphql_view(request)

        self.assertEqual(response.status_code, 200)
