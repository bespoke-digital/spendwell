
import os

from .base import *


ALLOWED_HOSTS = ['test.spendwell.co']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'test',
    'USER': os.environ['PG_USER'],
    'PASSWORD': os.environ['PG_PASSWORD'],
    'PORT': 5434,
}
