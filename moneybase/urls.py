
from django.conf.urls import url
from django.contrib import admin

from apps.core.views import app_view
from apps.landing.views import home_view


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^/?$', home_view),
    url(r'^', app_view),
]
