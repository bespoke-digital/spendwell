
from django.conf.urls import url

from .views import home_view, faq_view


urlpatterns = [
    url(r'^$', home_view, name='home'),
    url(r'^faq/$', faq_view, name='faq'),
]
