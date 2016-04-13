
import raven

from .base import *
from .secrets import db_password, plaid_secret, finicity_secret, raven_dsn


ALLOWED_HOSTS = ['*']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': '172.16.87.148',
    'NAME': 'spendwell',
    'USER': 'spendwell',
    'PASSWORD': db_password,
}

INSTALLED_APPS.append('raven.contrib.django.raven_compat')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


LOGGING['handlers']['sentry'] = {
    'level': 'ERROR',
    'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
}
LOGGING['loggers']['django']['handlers'] = ['console', 'sentry']


RAVEN_PUBLIC_DSN = 'https://e82e41c7ae084a72b64d0571f6b4dcfd@app.getsentry.com/73495'
RAVEN_CONFIG = {
    'dsn': raven_dsn,
    'release': raven.fetch_git_sha(BASE_DIR),
}

PLAID_PRODUCTION = True
PLAID_SECRET = plaid_secret

FINICITY_ENABLED = True
FINICITY_PRODUCTION = True
FINICITY_ID = '2445581415347'
FINICITY_SECRET = finicity_secret
FINICITY_APP_KEY = 'e152b1e1dc39cd13969ffc7dc954bb88'

MIXPANEL_PUBLIC_KEY = '25e4cbc88d444229cfcddfe21935ed2c'
GOOGLE_ANALYTICS_KEY = 'UA-71571230-1'
FACEBOOK_PIXEL_KEY = '227041677640062'
