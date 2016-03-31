
import time

from django.conf import settings

from xml.parsers.expat import ExpatError
import xmltodict
import requests


FINICITY_URL = 'https://api.finicity.com/aggregation'
VALID_QUERIES = ('cibc', 'bmo', 'president', 'scotia', 'finbank')
# VALID_QUERIES = []


class FinicityError(Exception):
    pass


class Finicity(object):
    def __init__(self, user):
        self.user = user

    def authenticate(self):
        response = requests.post(
            '{}/v2/partners/authentication'.format(FINICITY_URL),
            headers={
                'Content-Type': 'application/xml',
                'Finicity-App-Key': settings.FINICITY_APP_KEY,
            },
            data='''
                <credentials>
                    <partnerId>{}</partnerId>
                    <partnerSecret>{}</partnerSecret>
                </credentials>
            '''.format(
                settings.FINICITY_ID,
                settings.FINICITY_SECRET,
            ),
        )

        self.access_token = self.parse(response)['access']['token']

    def request(self, path, method='GET', **kwargs):
        if not hasattr(self, 'access_token'):
            self.authenticate()

        response = getattr(requests, method.lower())(
            '{}{}'.format(FINICITY_URL, path),
            headers={
                'Content-Type': 'application/xml',
                'Finicity-App-Key': settings.FINICITY_APP_KEY,
                'Finicity-App-Token': self.access_token,
            },
            **kwargs
        )

        response = self.parse(response)

        if 'error' in response:
            raise FinicityError('Finicity: {}'.format(response['error']['message']))

        return response

    def parse(self, response):
        try:
            return xmltodict.parse(response.content)
        except ExpatError:
            raise FinicityError('Unable to parse "{}"'.format(response.content))

    def ensure_customer(self):
        if self.user.finicity_id:
            return

        if settings.FINICITY_PRODUCTION:
            path = '/v1/customers/active'
        else:
            path = '/v1/customers/testing'

        body = '''
            <customer>
                <username>username{0}</username>
                <firstName>firstName{0}</firstName>
                <lastName>lastName{0}</lastName>
            </customer>
        '''.format(self.user.id)

        response = self.request(path, method='POST', data=body)
        self.user.finicity_id = response['customer']['id']
        self.user.save()

    def credentials_xml(self, credentials):
        return '<accounts><credentials>{}</credentials></accounts>'.format(
            ''.join([
                '''
                    <loginField>
                        <id>{id}</id>
                        <name>{name}</name>
                        <value>{value}</value>
                    </loginField>
                '''.format(id=id, **cred)
                for id, cred in credentials.items()
            ])
        )

    def list_institutions(self, query):
        if not any([valid in query for valid in VALID_QUERIES]):
            return []

        return self.request('/v1/institutions', params={
            'search': query.replace(' ', '+'),
            'start': 1,
            'limit': 10,
        })['institutions']['institution']

    def get_institution(self, id):
        return self.request('/v1/institutions/{}'.format(id))['institution']

    def get_login_form(self, institution_id):
        response = self.request('/v1/institutions/{}/loginForm'.format(institution_id))
        return response['loginForm']['loginField']

    def connect_institution(self, institution_id, credentials):
        self.ensure_customer()

        response = self.request(
            '/v1/customers/{}/institutions/{}/accounts/addall'.format(
                self.user.finicity_id,
                institution_id,
            ),
            method='POST',
            data=self.credentials_xml(credentials),
        )

        return response['accounts']['account']

    def list_accounts(self, institution_id, credentials):
        self.ensure_customer()

        path = '/v1/customers/{}/institutions/{}/accounts'.format(
            self.user.finicity_id,
            institution_id,
        )

        response = self.request(path, method='POST', data=self.credentials_xml(credentials))

        return response['accounts']['account']

    def list_transactions(self, institution_id):
        self.ensure_customer()
        self.request('/v1/customers/{}/accounts'.format(self.user.finicity_id), method='POST')

        path = '/v1/customers/{}/transactions'.format(self.user.finicity_id)
        to_date = int(time.time())
        from_date = int(to_date - 16416000)
        transactions = []

        while True:
            response = self.request(path, params={
                'fromDate': from_date,
                'toDate': to_date,
                'start': len(transactions),
                'limit': 1000,
            })
            if response['transactions']:
                transactions += response['transactions']['transaction']
                if len(response['transactions']['transaction']) < 1000:
                    break
            else:
                break

        return transactions
