
from .base import *
from .secrets import db_password, plaid_secret


ALLOWED_HOSTS = ['*']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': '172.16.87.148',
    'NAME': 'spendwell',
    'USER': 'spendwell',
    'PASSWORD': db_password,
}

PLAID_PRODUCTION = True
PLAID_SECRET = plaid_secret

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
