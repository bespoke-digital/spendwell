
import os

from celery import Celery
from raven.contrib.celery import register_signal, register_logger_signal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendwell.settings.local')
from django.conf import settings  # noqa

try:
    from raven.contrib.django.raven_compat.models import client as raven_client
    use_raven = True
except ImportError:
    use_raven = False


app = Celery('spendwell')
app.config_from_object(settings)
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


if use_raven:
    register_logger_signal(raven_client)
    register_signal(raven_client)
    register_logger_signal(raven_client)


@app.task(bind=True)
def debug_task(self, fail=False):
    print('Request: {0!r}'.format(self.request))
    if fail:
        raise Exception('You asked for it!')
