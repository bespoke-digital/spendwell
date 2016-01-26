
from rest_framework import serializers

from apps.core.serializers import SWOwnedSerializerMixin

from apps.categories.serializers import CategorySerializer
from .models import Transaction


class TransactionSerializer(SWOwnedSerializerMixin, serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'name',
            'id',
            'amount',
            'date',
            'category',
            'account',
        )
