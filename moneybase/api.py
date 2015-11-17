
from django.conf.urls import url, include
from rest_framework import routers

from apps.users.views import login_view, logout_view, refresh_view
from apps.institutions.viewsets import InstitutionViewSet


router = routers.DefaultRouter()
router.register(r'institutions', InstitutionViewSet)

urlpatterns = [
    url(r'^auth/login$', login_view, name='login'),
    url(r'^auth/logout$', logout_view, name='logout'),
    url(r'^auth/refresh$', refresh_view, name='refresh'),
    url(r'^', include(router.urls)),
]
