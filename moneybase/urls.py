
from rest_framework.response import Response

from django.conf.urls import url, include
from django.contrib import admin

from apps.core.views import app_view
from apps.landing.views import home_view


def test_view(request):
    return Response({'okay': True})


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('moneybase.api', namespace='api')),
    url(r'^test$', test_view),
    url(r'^/?$', home_view),
    url(r'^', app_view),
]
