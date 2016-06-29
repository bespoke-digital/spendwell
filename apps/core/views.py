
from random import randint
import logging

from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponseRedirect, Http404, HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from graphene.contrib.django.views import GraphQLView
from django_graphiql.views import GraphiQL
from csp.decorators import csp_exempt

from spendwell.schema import schema
from apps.core.utils.demo import export_demo_data, import_demo_data
from apps.finicity.client import FinicityException
from .models import LoadingQuote


logger = logging.getLogger(__name__)


class AuthGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponse(status=403)
        return super(AuthGraphQLView, self).dispatch(request, *args, **kwargs)

    @classmethod
    def format_error(Cls, error):
        if (
            hasattr(error, 'original_error') and
            error.original_error and
            not isinstance(error.original_error, FinicityException)
        ):
            try:
                raise error.original_error
            except:
                logger.exception('GraphQL error')

        return super(AuthGraphQLView, Cls).format_error(error)

auth_graphql_view = AuthGraphQLView.as_view(schema=schema)

graphiql_view = csp_exempt(login_required(GraphiQL.as_view()))


class ClientView(TemplateView):
    def get_context_data(self):
        context = super(ClientView, self).get_context_data()
        context['PLAID_PRODUCTION'] = settings.PLAID_PRODUCTION
        context['PLAID_PUBLIC_KEY'] = settings.PLAID_PUBLIC_KEY
        context['loading_quote'] = LoadingQuote.objects.all()[
            randint(0, LoadingQuote.objects.count() - 1)
        ]
        return context


class OnboardingView(ClientView):
    template_name = 'core/app.html'

onboarding_view = login_required(ensure_csrf_cookie(OnboardingView.as_view()))


class AppView(ClientView):
    template_name = 'core/app.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.accounts.count() == 0:
            return HttpResponseRedirect(reverse('onboarding'))
        else:
            return super(AppView, self).dispatch(request, *args, **kwargs)

app_view = login_required(ensure_csrf_cookie(AppView.as_view()))


class CalculatorsView(TemplateView):
    template_name = 'core/calculators.html'

calculators_view = CalculatorsView.as_view()


class ManifestView(TemplateView):
    template_name = 'manifest.json'
    content_type = 'application/json'

manifest_view = ManifestView.as_view()


def export_demo_data_view(request):
    if not request.user.is_authenticated() and request.user.is_admin:
        raise Http404

    export_demo_data()
    messages.success(request, 'Demo data saved')

    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def import_demo_data_view(request):
    if not request.user.is_authenticated() and request.user.is_admin:
        raise Http404

    import_demo_data()
    messages.success(request, 'Demo data loaded')

    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
