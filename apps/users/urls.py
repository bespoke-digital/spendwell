
from django.conf.urls import url, include

from .views import signup_view, demo_login_view, get_demo_key_view


urlpatterns = [
    url(r'^demo$', get_demo_key_view, name='get_demo_key'),
    url(r'^demo/(.+)', demo_login_view, name='demo_login'),
    url(r'^signup', signup_view, name='signup'),

    url(r'^', include('django.contrib.auth.urls')),
]