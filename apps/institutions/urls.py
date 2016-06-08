
from django.conf.urls import url

from .views import create_institution_template_view


urlpatterns = [
    url(r'^add/$', create_institution_template_view, name='create-institution-template'),
]
