
from random import random

from django.conf import settings
from django.core.cache import cache
from django.core.signing import Signer
import requests

from apps.core.utils.unique import unique
from .exceptions import YodleeException


signer = Signer()


class Yodlee(object):
    def __init__(self, user):
        self.user = user

    def request(self, method, path, data=None, authenticate_session=True, authenticate_user=True):
        url = 'https://developer.api.yodlee.com/ysl/restserver/v1{}'.format(path)

        headers = {}

        if authenticate_session:
            session_token = self.get_session_token()
        else:
            session_token = None

        if authenticate_user:
            user_token = self.get_user_token()
        else:
            user_token = None

        if session_token and not user_token:
            headers['Authorization'] = '{{cobSession={}}}'.format(session_token)
        elif session_token and user_token:
            headers['Authorization'] = '{{cobSession={},userSession={}}}'.format(
                session_token,
                user_token,
            )

        print('YODLEE')
        print('url\t', url)
        print('headers\t', headers)
        print('data\t', data)

        response = getattr(requests, method.lower())(url, headers=headers, json=data)

        print('status\t', response.status_code)
        print('content\t', response.content)

        if response.status_code not in (200, 201):
            raise YodleeException(response.content)

        return response.json()

    def get_session_token(self):
        token = cache.get('yodlee-session')
        if token:
            return token

        response = self.request('POST', '/cobrand/login', {
            'cobrand': {
                'cobrandLogin': settings.YODLEE_USERNAME,
                'cobrandPassword': settings.YODLEE_PASSWORD,
            }
        }, authenticate_session=False, authenticate_user=False)

        cache.set('yodlee-session', response['session']['cobSession'], 6000)

        return response['session']['cobSession']

    def get_user_token(self):
        token = cache.get('yodlee-user:{}'.format(self.user.id))
        if token:
            return token

        yodlee_username = 'user{}'.format(self.user.id)

        if not self.user.yodlee_password:
            seed = '{}{}'.format(random(), self.user.id)
            signed = signer.sign(seed).split(':')[-1]
            valid = ''.join(unique('aB0!{}'.format(signed)))

            self.user.yodlee_password = valid

            path = '/user/register'
        else:
            path = '/user/login'

        response = self.request('POST', path, {
            'user': {
                'loginName': yodlee_username,
                'password': self.user.yodlee_password,
                'email': self.user.email,
            }
        }, authenticate_user=False)

        if 'register' in path:
            self.user.save()

        cache.set(
            'yodlee-user:{}'.format(self.user.id),
            response['session']['userSession'],
            3000,
        )

        return response['session']['userSession']

    def get_fastlink(self):
        return self.request('GET', '/providers/token')
