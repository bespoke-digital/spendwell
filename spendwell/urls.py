
from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt

from graphene.contrib.django.views import GraphQLView

from apps.core.views import app_view
from apps.landing.views import home_view

from .admin import admin_site
from .schema import schema


urlpatterns = [
    url(r'^admin/', admin_site.urls),
    url(r'^graphql', csrf_exempt(GraphQLView.as_view(schema=schema))),
    url(r'^graphiql', include('django_graphiql.urls')),
    url(r'^$', home_view),
    url(r'^', app_view),
]
