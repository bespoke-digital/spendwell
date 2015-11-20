
from rest_framework import viewsets

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(MBOwnedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
