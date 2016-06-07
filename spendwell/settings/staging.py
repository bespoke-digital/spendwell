
import raven

from .base import *
from .secrets import (
    db_password,
    plaid_secret,
    finicity_secret,
    raven_dsn,
    twitter_consumer_secret,
    twitter_access_token_secret,
    mailgun_smtp_password,
)


SITE_DOMAIN = 'staging.spendwell.co'
ALLOWED_HOSTS = [SITE_DOMAIN]

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': '172.16.87.152',
    'NAME': 'stage_spendwell',
    'USER': 'spendwell',
    'PASSWORD': db_password,
}

INSTALLED_APPS.append('raven.contrib.django.raven_compat')

MIDDLEWARE_CLASSES.append('raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware')


LOGGING['handlers']['sentry'] = {
    'level': 'ERROR',
    'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
}
LOGGING['loggers']['django']['handlers'] = ['console', 'sentry']


EMAIL_HOST_PASSWORD = mailgun_smtp_password


RAVEN_PUBLIC_DSN = 'https://f5915ddc585f49798179209ff074b43a@app.getsentry.com/73490'
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

# MIXPANEL_PUBLIC_KEY = '25e4cbc88d444229cfcddfe21935ed2c'
# GOOGLE_ANALYTICS_KEY = 'UA-71571230-1'
# FACEBOOK_PIXEL_KEY = '227041677640062'

TWITTER_CONSUMER_SECRET = twitter_consumer_secret
TWITTER_ACCESS_TOKEN_SECRET = twitter_access_token_secret
