
from django.db.models import Sum

from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from apps.core.serializers import SWSerializerMixin

from apps.transactions.models import Transaction
from .models import Category


class CategorySerializer(SWSerializerMixin, serializers.ModelSerializer):
    # balance = serializers.SerializerMethodField()
    children = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'parent', 'children')

    def get_balance(self, category):
        return (
            Transaction.objects
            .filter(owner=self.context['request'].user)
            .filter(category__in=category.all_children() + [category])
            .aggregate(Sum('amount'))
            ['amount__sum']
        )
