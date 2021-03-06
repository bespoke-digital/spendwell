
from django.core.signing import Signer

from .models import User, AuthToken


class DemoBackend(object):
    def authenticate(self, demo_key=None):
        demo_key = Signer().unsign('demo:{}'.format(demo_key))

        if demo_key == 'demo':
            return User.objects.get(email='demo@spendwell.co')
        else:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class TokenBackend(object):
    def authenticate(self, token=None):
        if not token:
            return

        try:
            return AuthToken.objects.get(token=token).user
        except AuthToken.DoesNotExist:
            return

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
