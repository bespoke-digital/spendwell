
import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


SECRET_KEY = '&;v_CEg*j%lmzulK(qS.J1Brlezwshavj+`yu5nZc~]A6,G9fuHGWI$hw"WOe'

DEBUG = False

ALLOWED_HOSTS = ['app.spendwell.co']
CSRF_COOKIE_SECURE = True


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
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'cache',
    }
}

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
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.CachedStaticFilesStorage'


LOGIN_REDIRECT_URL = '/app'
LOGIN_URL = '/login'


PLAID_PRODUCTION = False
PLAID_CLIENT_ID = '5642567be7dbd3891f08e5a4'
PLAID_PUBLIC_KEY = '4b747132cf8c427bec79f00e0dcb4a'
PLAID_SECRET = None

FINICITY_ENABLED = False
FINICITY_PRODUCTION = False
FINICITY_ID = '2445581415347'
FINICITY_SECRET = None
FINICITY_APP_KEY = 'e152b1e1dc39cd13969ffc7dc954bb88'

MIXPANEL_PUBLIC_KEY = 'setme'
GOOGLE_ANALYTICS_KEY = 'setme'
FACEBOOK_PIXEL_KEY = 'setme'
