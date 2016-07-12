
from django.conf.urls import url, include

from .views import (
    signup_view,
    demo_login_view,
    get_demo_key_view,
    beta_signup_view,
    beta_signup_generator_view,
    token_auth_view,
)


urlpatterns = [
    url(r'^demo$', get_demo_key_view, name='get_demo_key'),
    url(r'^demo/(.+)', demo_login_view, name='demo_login'),
    url(r'^signup', signup_view, name='signup'),
    url(r'^beta-signup/thmxy03wh4vutrrcxi', beta_signup_generator_view, name='beta-signup-generator'),
    url(r'^beta-signup', beta_signup_view, name='beta-signup'),
    url(r'^generate-token', token_auth_view, name='token-auth'),

    url(r'^', include('django.contrib.auth.urls')),
]
