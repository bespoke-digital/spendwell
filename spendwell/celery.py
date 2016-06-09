
import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spendwell.settings.local')
from django.conf import settings  # noqa


app = Celery('spendwell')
app.config_from_object(settings)
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
