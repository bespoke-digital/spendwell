
from django.views.generic import TemplateView


class AppView(TemplateView):
    template_name = 'core/app.html'

app_view = AppView.as_view()
