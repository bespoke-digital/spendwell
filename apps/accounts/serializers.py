
from rest_framework import serializers

from apps.core.serializers import SWOwnedSerializerMixin
from apps.transactions.serializers import TransactionSerializer
from .models import Account


class AccountSerializer(SWOwnedSerializerMixin, serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = (
            'id',
            'institution',
            'type',
            'subtype',
            'name',
            'number_snippet',
            'balance_current',
            'balance_available',
            'last_updated',
            'transactions',
        )
