
from django import forms
import django_filters as filters

from apps.categories.models import Category

from .models import Transaction


class BooleanMethodFilter(filters.MethodFilter):
    field_class = forms.NullBooleanField


class TransactionFilter(filters.FilterSet):
    description_exact = filters.CharFilter(name='description', lookup_type='iexact')
    description_contains = filters.CharFilter(name='description', lookup_type='icontains')
    amount_lt = filters.NumberFilter(name='amount', lookup_type='lt')
    amount_gt = filters.NumberFilter(name='amount', lookup_type='gt')
    category = filters.MethodFilter()
    date_lte = filters.DateTimeFilter(name='date', lookup_type='lte')
    date_gte = filters.DateTimeFilter(name='date', lookup_type='gte')
    is_transfer = BooleanMethodFilter()
    source_exact = filters.CharFilter(name='source', lookup_type='exact')

    class Meta:
        model = Transaction
        fields = (
            'description_exact',
            'description_contains',
            'amount_gt',
            'amount_lt',
            'category',
            'date_lte',
            'date_gte',
            'from_savings',
            'is_transfer',
            'source_exact',
        )

    def filter_category(self, queryset, value):
        category = Category.objects.get(id=value)
        return queryset.filter(category__in=[category] + category.all_children())

    def filter_is_transfer(self, queryset, value):
        return queryset.is_transfer(value)
