
from rest_framework import viewsets
from rest_framework.filters import DjangoFilterBackend
import django_filters as filters

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionFilter(filters.FilterSet):
    class Meta:
        model = Transaction
        fields = {
            'name': ['icontains'],
            # 'category',
            # 'account',
            # 'date',
            # 'address_city',
            # 'address_street',
            # 'address_state',
        }


class TransactionViewSet(MBOwnedViewSetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = TransactionFilter
