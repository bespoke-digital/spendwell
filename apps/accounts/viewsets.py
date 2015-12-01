
from rest_framework import viewsets

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Account
from .serializers import AccountSerializer


class AccountViewSet(MBOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
