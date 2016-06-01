
import raven

from .base import *


ALLOWED_HOSTS = ['test.spendwell.co']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'spendwell',
}
