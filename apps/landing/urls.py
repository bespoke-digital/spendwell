
from django.conf.urls import url

from .views import (
    home_view,
    freedom_view,
    debt_view,
)


urlpatterns = [
    url(r'^$', home_view, name='home'),
    url(r'^financial-freedom/$', freedom_view, name='freedom'),
    url(r'^crush-your-debt/$', debt_view, name='debt'),
]
