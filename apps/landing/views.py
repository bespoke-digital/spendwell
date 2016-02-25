
from django.views.generic import TemplateView


home_view = TemplateView.as_view(template_name='landing/home.html')
freedom_view = TemplateView.as_view(template_name='landing/freedom.html')
debt_view = TemplateView.as_view(template_name='landing/debt.html')
