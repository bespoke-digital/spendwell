
import time
import json
import logging
from uuid import uuid4
from collections import OrderedDict
from xml.etree import ElementTree as ET
from xml.parsers.expat import ExpatError

from django.conf import settings
from django.core.cache import cache

import xmltodict
import requests

from .utils import maybe_list


logger = logging.getLogger(__name__)

FINICITY_URL = 'https://api.finicity.com/aggregation'
FINICITY_RETRIES = 3


def mfa_cache_key(user):
    return 'finicity-mfa:{}'.format(user.id)


class FinicityException(Exception):
    pass


class FinicityError(FinicityException):
    pass


class FinicityInvalidAccountError(FinicityError):
    pass


class FinicityValidation(FinicityException):
    pass


class FinicityMFAException(FinicityException):
    def __init__(self, user, response, data):
        self.user = user
        self.response = response
        self.session = response.headers['MFA-Session']

        self.challenges = data['mfaChallenges']['questions']['question']
        if isinstance(self.challenges, OrderedDict):
            self.challenges = [self.challenges]

        cache.set(mfa_cache_key(user), {
            'session': self.session,
            'challenges': self.challenges,
        }, 120)

        message = 'finicity-mfa-required:{}'.format(json.dumps(self.challenges))

        super(FinicityMFAException, self).__init__(message)


class Finicity(object):
    def __init__(self, user):
        self.user = user

    def authenticate(self, force=False):
        self.access_token = cache.get('finicity-access-token')

        if self.access_token and not force:
            return

        credentials = ET.Element('credentials')
        ET.SubElement(credentials, 'partnerId').text = settings.FINICITY_ID
        ET.SubElement(credentials, 'partnerSecret').text = settings.FINICITY_SECRET

        response = requests.post(
            '{}/v2/partners/authentication'.format(FINICITY_URL),
            headers={
                'Content-Type': 'application/xml',
                'Finicity-App-Key': settings.FINICITY_APP_KEY,
            },
            data=ET.tostring(credentials),
        )

        if b'<html>' in response.content:
            raise FinicityError('Finicity: HTML response')

        data = self.parse(response)

        if 'error' in data:
            raise FinicityError('Finicity: {}'.format(data['error']['message']))

        self.access_token = data['access']['token']

        cache.set('finicity-access-token', self.access_token, 7200)

    def request(self, path, method='GET', headers=None, force_auth=False, retries=0, **kwargs):
        if force_auth or not hasattr(self, 'access_token'):
            self.authenticate(force=force_auth)

        headers = headers or {}
        headers['Content-Type'] = 'application/xml'
        headers['Finicity-App-Key'] = settings.FINICITY_APP_KEY
        headers['Finicity-App-Token'] = self.access_token

        response = getattr(requests, method.lower())(
            '{}{}'.format(FINICITY_URL, path),
            headers=headers,
            **kwargs
        )

        if b'<html>' in response.content:
            raise FinicityError('Finicity: HTML response')

        data = self.parse(response)

        if response.status_code == 203:
            raise FinicityMFAException(self.user, response, data)

        if 'error' in data:
            if not force_auth and data['error']['code'] in ('103', '10022', '10023'):
                return self.request(path, method, headers, force_auth=True, **kwargs)

            if not force_auth and data['error']['code'] in ('44000',) and retries < FINICITY_RETRIES:
                return self.request(path, method, headers, force_auth=False, retries=retries + 1, **kwargs)

            if data['error']['code'] in ('103', '187', '185'):
                raise FinicityValidation('finicity-invalid-credentials')

            if data['error']['code'] in ('108', '109'):
                raise FinicityValidation('finicity-user-action-required')

            if data['error']['code'] in ('331',):
                raise FinicityValidation('finicity-mfa-expired')

            if data['error']['code'] in ('38006',):
                raise FinicityInvalidAccountError()

            if settings.DEBUG:
                print('\n\nFINICITY REQUEST')
                print(method, path)
                if 'data' in kwargs:
                    print(kwargs['data'])
                print('\nFINICITY RESPONSE')
                print(response.content)

            if 'message' in data['error']:
                error_text = 'Finicity: {}'.format(data['error']['message'])
            else:
                error_text = 'Finicity: Error code {}'.format(data['error']['code'])

            raise FinicityError(error_text)

        return data

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

        user_id = '{}{}'.format(self.user.id, uuid4().hex[:5])

        customer = ET.Element('customer')
        ET.SubElement(customer, 'username').text = 'username{}'.format(user_id)
        ET.SubElement(customer, 'firstName').text = 'firstName{}'.format(user_id)
        ET.SubElement(customer, 'lastName').text = 'lastName{}'.format(user_id)

        response = self.request(path, method='POST', data=ET.tostring(customer))
        self.user.finicity_id = response['customer']['id']
        self.user.save()

    def credentials_xml(self, credential_data):
        accounts = ET.Element('accounts')
        credentials = ET.SubElement(accounts, 'credentials')

        for id, cred in credential_data.items():
            login_field = ET.SubElement(credentials, 'loginField')
            ET.SubElement(login_field, 'id').text = id
            ET.SubElement(login_field, 'name').text = cred['name']
            ET.SubElement(login_field, 'value').text = cred['value']

        return ET.tostring(accounts)

    def mfa_xml(self, answers):
        mfa_data = cache.get(mfa_cache_key(self.user))
        if not mfa_data:
            raise FinicityValidation('finicity-mfa-expired')

        accounts = ET.Element('accounts')
        mfa_challenges = ET.SubElement(accounts, 'mfaChallenges')
        questions = ET.SubElement(mfa_challenges, 'questions')

        for index, question_data in enumerate(mfa_data['challenges']):
            question = ET.SubElement(questions, 'question')

            for key, value in question_data.items():
                question_item = ET.SubElement(question, key)
                question_item.text = value

            answer = ET.SubElement(question, 'answer')
            answer.text = answers[index]

        return ET.tostring(accounts), mfa_data['session']

    def list_institutions(self, query):
        response = self.request('/v1/institutions', params={
            'search': query,
            'start': 1,
            'limit': 10,
        })

        return maybe_list(response['institutions'].get('institution', []))

    def get_institution(self, id):
        return self.request('/v1/institutions/{}'.format(id))['institution']

    def get_login_form(self, institution_id):
        response = self.request('/v1/institutions/{}/loginForm'.format(institution_id))
        return response['loginForm']['loginField']

    def connect_institution(self, institution_id, credentials=None, mfa_answers=None):
        self.ensure_customer()

        path = '/v1/customers/{}/institutions/{}/accounts/addall'.format(
            self.user.finicity_id,
            institution_id,
        )

        if mfa_answers:
            path += '/mfa'
            body, session = self.mfa_xml(mfa_answers)
            headers = {'MFA-Session': session}

        elif credentials:
            body = self.credentials_xml(credentials)
            headers = {}

        else:
            raise ValueError(
                'credentials or mfa_answers must be used to connect a '
                'finicity account.'
            )

        response = self.request(path, method='POST', data=body, headers=headers)

        return maybe_list(response['accounts']['account'])

    def list_accounts(self, institution_id):
        self.ensure_customer()

        response = self.request('/v1/customers/{}/institutions/{}/accounts'.format(
            self.user.finicity_id,
            institution_id,
        ))

        return maybe_list(response['accounts']['account'])

    def list_transactions(self, institution_id):
        self.ensure_customer()
        self.request('/v1/customers/{}/accounts'.format(self.user.finicity_id), method='POST')

        path = '/v2/customers/{}/transactions'.format(self.user.finicity_id)
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
                response_data = maybe_list(response['transactions']['transaction'])
                transactions += response_data
                if len(response_data) < 1000:
                    break
            else:
                break

        return transactions
