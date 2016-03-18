
from django.conf import settings

import xmltodict
import requests


FINICITY_URL = 'https://api.finicity.com/aggregation'


class Finicity(object):
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

        return self.parse(response)

    def parse(self, response):
        return xmltodict.parse(response.content)

    def search(self, input):
        return self.request('/v1/institutions', params={
            'search': input.replace(' ', '+'),
            'start': 1,
            'limit': 10,
        })
