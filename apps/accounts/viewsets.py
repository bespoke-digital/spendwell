
from rest_framework import viewsets

from apps.core.viewsets import SWOwnedViewSetMixin

from .models import Account
from .serializers import AccountSerializer


class AccountViewSet(SWOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
