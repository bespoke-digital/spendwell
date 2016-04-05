
from django.conf.urls import url

from .views import add_institution_view


urlpatterns = [
    url(r'^add-institution/$', add_institution_view, name='add-institution'),
]
