
from django.conf import settings as django_settings


def settings(request):
    return {
        'MIXPANEL_PUBLIC_KEY': django_settings.MIXPANEL_PUBLIC_KEY,
        'GOOGLE_ANALYTICS_KEY': django_settings.GOOGLE_ANALYTICS_KEY,
        'FACEBOOK_PIXEL_KEY': django_settings.FACEBOOK_PIXEL_KEY,
    }
