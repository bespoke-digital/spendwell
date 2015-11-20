
from django.conf.urls import url, include
from django.http import HttpResponse

from rest_framework import routers
from rest_framework import status

from apps.institutions.viewsets import InstitutionViewSet
from apps.transactions.viewsets import TransactionViewSet
from apps.categories.viewsets import CategoryViewSet


router = routers.DefaultRouter(trailing_slash=False)
router.register(r'institutions', InstitutionViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    url(r'^auth/', include('djoser.urls.authtoken')),
    url(r'^', include(router.urls)),
    url(r'^', lambda r: HttpResponse(status=status.HTTP_404_NOT_FOUND)),
]
