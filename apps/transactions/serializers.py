
from rest_framework import serializers

from apps.core.serializers import MBOwnedSerializerMixin

from .models import Transaction


class TransactionSerializer(MBOwnedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('name', 'id', 'amount', 'date', 'category', 'account')
