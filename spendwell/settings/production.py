
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

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

PLAID_PRODUCTION = False
PLAID_SECRET = plaid_secret

MIXPANEL_PUBLIC_KEY = '25e4cbc88d444229cfcddfe21935ed2c'
GOOGLE_ANALYTICS_KEY = 'UA-71571230-1'
FACEBOOK_PIXEL_KEY = '227041677640062'
