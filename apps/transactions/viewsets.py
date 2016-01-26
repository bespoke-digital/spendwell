
from rest_framework import viewsets
from rest_framework.filters import DjangoFilterBackend

from apps.core.viewsets import SWOwnedViewSetMixin

from .models import Transaction
from .serializers import TransactionSerializer
from .filters import TransactionFilter


class TransactionViewSet(SWOwnedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = TransactionFilter
