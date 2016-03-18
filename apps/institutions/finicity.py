
from django.conf import settings

import graphene
from graphene.utils import to_snake_case

import xmltodict
import requests


FINICITY_URL = 'https://api.finicity.com/aggregation'
VALID_QUERIES = ('cibc', 'bmo', 'president', 'scotia')


class FinicityLoginField(graphene.ObjectType):
    id = graphene.String()
    name = graphene.String()
    value = graphene.String()
    description = graphene.String()
    display_order = graphene.String()
    mask = graphene.String()
    value_length_min = graphene.String()
    value_length_max = graphene.String()
    instructions = graphene.String()

    def __init__(self, *args, **kwargs):
        self.finicity = kwargs.pop('finicity')

        kwargs = {to_snake_case(k): v for k, v in kwargs.items()}
        super(FinicityLoginField, self).__init__(*args, **kwargs)


class FinicityInstitution(graphene.relay.Node):
    name = graphene.String()
    account_type_description = graphene.String()
    url_home_app = graphene.String()
    url_logon_app = graphene.String()
    url_product_app = graphene.String()
    login_form = graphene.List(FinicityLoginField)

    @classmethod
    def get_node(cls, id, info):
        return Finicity(info.request_context.user).get_institution(id)

    def __init__(self, *args, **kwargs):
        kwargs = {to_snake_case(k): v for k, v in kwargs.items()}
        self.id = kwargs.pop('id', None)
        self.finicity = kwargs.pop('finicity')
        super(FinicityInstitution, self).__init__(*args, **kwargs)

    def resolve_login_form(self, args, info):
        return self.finicity.get_login_form(self.id)


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

    def ensure_customer(self):
        if self.user.finicity_id:
            return

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

    def search(self, query):
        if not any([valid in query for valid in VALID_QUERIES]):
            return []

        return [
            FinicityInstitution(finicity=self, **result)
            for result in self.request('/v1/institutions', params={
                'search': query.replace(' ', '+'),
                'start': 1,
                'limit': 10,
            })['institutions']['institution']
        ]

    def get_institution(self, id):
        response = self.request('/v1/institutions/{}'.format(id))
        return FinicityInstitution(finicity=self, **response['institution'])

    def get_login_form(self, institution_id):
        response = self.request('/v1/institutions/{}/loginForm'.format(institution_id))

        return [
            FinicityLoginField(finicity=self, **field)
            for field in response['loginForm']['loginField']
        ]
