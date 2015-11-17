
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['dev.moneybase.co']

DATABASES['default'] = {
    'USER': 'postgres',
    'PASSWORD': 'dbpass',
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'moneybase',
}
