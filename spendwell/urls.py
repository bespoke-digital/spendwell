
from django.conf.urls import url, include

from .admin import admin_site
from apps.core.views import app_view
from apps.landing.views import home_view


urlpatterns = [
    url(r'^admin/', admin_site.urls),
    url(r'^api/', include('spendwell.api', namespace='api')),
    url(r'^$', home_view),
    url(r'^', app_view),
]
