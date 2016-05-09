
from random import randint

from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.conf import settings

from .models import LoadingQuote


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
