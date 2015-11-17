
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = 'landing/home.html'

home_view = HomeView.as_view()
