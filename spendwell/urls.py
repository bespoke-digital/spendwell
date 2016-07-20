
from django.conf.urls import url, include

from .admin import admin_site


urlpatterns = [
    url(r'^', include('apps.core.urls')),
    url(r'^', include('apps.users.urls')),
    url(r'^', include('apps.landing.urls', namespace='landing')),

    url(r'^admin/', admin_site.urls),

    url(r'^watchman/', include('watchman.urls')),
    url(r'^blog/', include('apps.blog.urls', namespace='blog')),
    url(r'^markdown/', include('django_markdown.urls')),
    url(r'^institutions/', include('apps.institutions.urls', namespace='institutions')),
    url(r'^ads/', include('apps.ads.urls', namespace='ads')),
]
