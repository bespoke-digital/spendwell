
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required


class AppView(TemplateView):
    template_name = 'core/app.html'

app_view = login_required(ensure_csrf_cookie(AppView.as_view()))
