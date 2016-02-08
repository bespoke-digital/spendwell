
from django.conf import settings as django_settings


def settings(request):
    return {
        'REACT_HOT_LOADING': django_settings.REACT_HOT_LOADING,
    }
