
from django.conf import settings as django_settings
from django.utils import timezone


def settings(request):
    return {
        'MIXPANEL_PUBLIC_KEY': django_settings.MIXPANEL_PUBLIC_KEY,
        'GOOGLE_ANALYTICS_KEY': django_settings.GOOGLE_ANALYTICS_KEY,
        'FACEBOOK_PIXEL_KEY': django_settings.FACEBOOK_PIXEL_KEY,
        'RAVEN_DNS': django_settings.RAVEN_CONFIG['dns'],
    }


def copyright_year(request):
    return {
        'copyright_year': timezone.now().year,
    }
