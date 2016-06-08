
from django.http import HttpResponse
from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from graphene.contrib.django.views import GraphQLView
from django_graphiql.views import GraphiQL
from csp.decorators import csp_exempt

from apps.core.views import app_view, onboarding_view, calculators_view, manifest_view

from .admin import admin_site
from .schema import schema

try:
    from raven.contrib.django.raven_compat.models import client as raven
    use_raven = True
except ImportError:
    use_raven = False


class AuthGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponse(status=403)
        return super(AuthGraphQLView, self).dispatch(request, *args, **kwargs)

    @classmethod
    def format_error(Cls, error):
        if hasattr(error, 'original_error') and error.original_error and use_raven:
            try:
                raise error.original_error
            except:
                raven.captureException()

        return super(AuthGraphQLView, Cls).format_error(error)

auth_graphql_view = AuthGraphQLView.as_view(schema=schema)

graphiql_view = csp_exempt(login_required(GraphiQL.as_view()))


urlpatterns = [
    url(r'^admin/', admin_site.urls),
    url(r'^watchman/', include('watchman.urls')),
    url(r'^institutions/', include('apps.institutions.urls', namespace='institutions')),
    url(r'^ads/', include('apps.ads.urls', namespace='ads')),

    url(r'^graphiql', graphiql_view, name='graphiql'),
    url(r'^graphql', auth_graphql_view, name='graphql'),
    url(r'^app', app_view, name='app'),
    url(r'^onboarding', onboarding_view, name='onboarding'),
    url(r'^manifest.json$', manifest_view, name='manifest'),
    url(r'^calculators/debt-repayment-calculator', calculators_view, name='calculators'),

    url(r'^', include('apps.users.urls')),
    url(r'^', include('apps.landing.urls', namespace='landing')),
]
