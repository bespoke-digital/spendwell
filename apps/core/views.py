
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView


class AppView(TemplateView):
    template_name = 'core/app.html'

app_view = ensure_csrf_cookie(AppView.as_view())
