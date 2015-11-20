
from django.conf.urls import url, include
from rest_framework import routers

from apps.institutions.viewsets import InstitutionViewSet


router = routers.DefaultRouter(trailing_slash=False)
router.register(r'institutions', InstitutionViewSet)

urlpatterns = [
    url(r'^auth/', include('djoser.urls.authtoken')),
    url(r'^', include(router.urls)),
]
