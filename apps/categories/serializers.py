
from django.db.models import Sum

from rest_framework import serializers

from apps.core.serializers import MBSerializerMixin

from apps.transactions.models import Transaction
from .models import Category


class CategorySerializer(MBSerializerMixin, serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('name', 'type', 'parent', 'balance')

    def get_balance(self, category):
        return (
            Transaction.objects
            .filter(owner=self.context['request'].user)
            .filter(category__in=category.all_children() + [category])
            .aggregate(Sum('amount'))
            ['amount__sum']
        )
