
from django.conf import settings

from mixpanel import Mixpanel


mixpanel = Mixpanel(settings.MIXPANEL_PUBLIC_KEY)
