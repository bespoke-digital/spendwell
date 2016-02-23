
from django.http import HttpResponse
from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from graphene.contrib.django.views import GraphQLView
from django_graphiql.views import GraphiQL

from apps.core.views import app_view, onboarding_view
from apps.landing.views import home_view
from apps.users.views import signup_view

from .admin import admin_site
from .schema import schema


class AuthGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponse(status=403)
        return super(AuthGraphQLView, self).dispatch(request, *args, **kwargs)

auth_graphql_view = AuthGraphQLView.as_view(schema=schema)

graphiql_view = login_required(GraphiQL.as_view())


urlpatterns = [
    url(r'^admin/', admin_site.urls),
    url(r'^', include('django.contrib.auth.urls')),
    url(r'^watchman/', include('watchman.urls')),

    url(r'^$', home_view, name='home'),
    url(r'^signup', signup_view, name='signup'),
    url(r'^graphiql', graphiql_view, name='graphiql'),
    url(r'^graphql', auth_graphql_view, name='graphql'),
    url(r'^app', app_view, name='app'),
    url(r'^onboarding', onboarding_view, name='onboarding'),
]
