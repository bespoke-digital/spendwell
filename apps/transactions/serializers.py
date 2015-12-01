
from rest_framework import serializers

from apps.core.serializers import MBOwnedSerializerMixin

from apps.categories.serializers import CategorySerializer
from .models import Transaction


class TransactionSerializer(MBOwnedSerializerMixin, serializers.ModelSerializer):
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
