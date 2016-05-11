
from django.conf.urls import url

from .views import twitter_download_view


urlpatterns = [
    url(r'^twitter-download/$', twitter_download_view, name='twitter-download'),
]
