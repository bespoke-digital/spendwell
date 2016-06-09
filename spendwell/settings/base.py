
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


SECRET_KEY = '&;v_CEg*j%lmzulK(qS.J1Brlezwshavj+`yu5nZc~]A6,G9fuHGWI$hw"WOe'

SITE_DOMAIN = 'www.spendwell.co'
ALLOWED_HOSTS = [SITE_DOMAIN]

DEBUG = False
CSRF_COOKIE_SECURE = True
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

CSP_DEFAULT_SRC = ('https:', "'self'")
CSP_STYLE_SRC = ('https:', "'self'", "'unsafe-inline'")
CSP_IMG_SRC = ('https:', 'data:', "'self'")


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_graphiql',
    'graphene.contrib.django',
    'watchman',
    'django_extensions',
    'security_middleware',

    'apps.core',
    'apps.landing',
    'apps.users',
    'apps.institutions',
    'apps.accounts',
    'apps.transactions',
    'apps.categories',
    'apps.buckets',
    'apps.goals',
    'apps.finicity',
    'apps.ads',
]

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'security_middleware.middleware.SSLMiddleware',
    'security_middleware.middleware.XSSProtectionMiddleware',
    'security_middleware.middleware.NoSniffMiddleware',
    'csp.middleware.CSPMiddleware',

    'apps.users.middleware.BetaCodeMiddleware',
]

ROOT_URLCONF = 'spendwell.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': (
            'django.contrib.auth.context_processors.auth',
            'django.template.context_processors.debug',
            'django.template.context_processors.i18n',
            'django.template.context_processors.media',
            'django.template.context_processors.static',
            'django.template.context_processors.tz',
            'django.template.context_processors.request',
            'django.contrib.messages.context_processors.messages',
            'apps.core.context_processors.settings',
            'apps.core.context_processors.copyright_year',
        ),
    },
}]

WSGI_APPLICATION = 'spendwell.wsgi.application'


DATABASES = {'default': {}}  # set in local settings


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'apps.users.backends.DemoBackend',
)

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
    },
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
USE_I18N = False
USE_L10N = False


MEDIA_URL = '/media/'
MEDIA_ROOT = 'media'

STATIC_URL = '/static/'
STATIC_ROOT = 'collected_static'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'


LOGIN_REDIRECT_URL = '/app'
LOGIN_URL = '/login'


DEFAULT_FROM_EMAIL = 'Spendwell <hello@spendwell.co>'
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_HOST_USER = 'postmaster@spendwell.co'
EMAIL_HOST_PASSWORD = None


GEOIP_PATH = '/data/shared/'
GEOIP_COUNTRY = 'GeoIP2-Country.mmdb'


BROKER_URL = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ('json',)


PLAID_PRODUCTION = False
PLAID_CLIENT_ID = '5642567be7dbd3891f08e5a4'
PLAID_PUBLIC_KEY = '4b747132cf8c427bec79f00e0dcb4a'
PLAID_SECRET = None

FINICITY_ENABLED = False
FINICITY_PRODUCTION = False
FINICITY_ID = '2445581415347'
FINICITY_SECRET = None
FINICITY_APP_KEY = 'e152b1e1dc39cd13969ffc7dc954bb88'

INCLUDE_ANALYTICS = False
MIXPANEL_PUBLIC_KEY = 'setme'
GOOGLE_ANALYTICS_KEY = 'setme'
FACEBOOK_PIXEL_KEY = 'setme'

TWITTER_CONSUMER_KEY = '1C9J8kD7rQjB2aPeFn2KdAHuM'
TWITTER_CONSUMER_SECRET = None
TWITTER_ACCESS_TOKEN_KEY = '4510053751-KpDrPjddh9CDm3hvf5hdVoQWyH538JgKqpaa0r0'
TWITTER_ACCESS_TOKEN_SECRET = None
