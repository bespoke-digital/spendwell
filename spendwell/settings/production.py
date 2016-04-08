
from .base import *
from .secrets import db_password, plaid_secret, finicity_secret


ALLOWED_HOSTS = ['*']

DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': '172.16.87.148',
    'NAME': 'spendwell',
    'USER': 'spendwell',
    'PASSWORD': db_password,
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

RAVEN_CONFIG['dsn'] = 'https://33804f768e684b668d41d19b6d1cd897:9d395cb3e8a947a5989ef516fc528c26@app.getsentry.com/73495'

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
