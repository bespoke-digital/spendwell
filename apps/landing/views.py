
from django.views.generic import TemplateView


home_view = TemplateView.as_view(template_name='landing/home.html')
faq_view = TemplateView.as_view(template_name='landing/faq.html')
