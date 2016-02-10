
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from django.conf import settings


class AppView(TemplateView):
    template_name = 'core/app.html'

    def get_context_data(self):
        context = super(AppView, self).get_context_data()
        context['PLAID_PRODUCTION'] = settings.PLAID_PRODUCTION
        context['PLAID_PUBLIC_KEY'] = settings.PLAID_PUBLIC_KEY
        return context

app_view = login_required(ensure_csrf_cookie(AppView.as_view()))
