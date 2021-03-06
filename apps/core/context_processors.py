
from django.conf import settings as django_settings
from django.utils import timezone


def settings(request):
    return {
        'INCLUDE_ANALYTICS': django_settings.INCLUDE_ANALYTICS,
        'MIXPANEL_PUBLIC_KEY': django_settings.MIXPANEL_PUBLIC_KEY,
        'GOOGLE_ANALYTICS_KEY': django_settings.GOOGLE_ANALYTICS_KEY,
        'FACEBOOK_PIXEL_KEY': django_settings.FACEBOOK_PIXEL_KEY,
        'RAVEN_PUBLIC_DSN': getattr(django_settings, 'RAVEN_PUBLIC_DSN', None),
    }


def copyright_year(request):
    return {
        'copyright_year': timezone.now().year,
    }
