
from django.db.models import Sum
from rest_framework import serializers

from apps.core.serializers import MBSerializerMixin

from .models import Category


class CategorySerializer(MBSerializerMixin, serializers.ModelSerializer):
    balance = serializers.SerializerMethodField

    class Meta:
        model = Category
        fields = ('name', 'type', 'parent')

    def get_balance(self, category):
        return (
            category
            .transactions
            .filter(owner=self.context['request'].user)
            .aggregate(Sum('amount'))
            ['amount__sum']
        )
