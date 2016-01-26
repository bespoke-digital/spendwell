
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['dev.spendwell.co']

DATABASES['default'] = {
    'USER': 'postgres',
    'PASSWORD': 'dbpass',
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'moneybase',
}

PLAID_SECRET = 'da9810c55be7680311950088a45d22'
