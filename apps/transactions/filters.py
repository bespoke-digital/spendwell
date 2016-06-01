
from django import forms
import django_filters as filters

from .models import Transaction


class BooleanMethodFilter(filters.MethodFilter):
    field_class = forms.NullBooleanField


class TransactionFilter(filters.FilterSet):
    description_exact = filters.CharFilter(name='description', lookup_type='iexact')
    description_contains = filters.CharFilter(name='description', lookup_type='icontains')
    amount_exact = filters.NumberFilter(name='amount')
    amount_lt = filters.NumberFilter(name='amount', lookup_type='lt')
    amount_gt = filters.NumberFilter(name='amount', lookup_type='gt')
    date_lte = filters.DateTimeFilter(name='date', lookup_type='lte')
    date_gte = filters.DateTimeFilter(name='date', lookup_type='gte')
    is_transfer = BooleanMethodFilter()
    source_exact = filters.CharFilter(name='source', lookup_type='exact')
    account = filters.NumberFilter(name='account_id')

    class Meta:
        model = Transaction
        fields = (
            'description_exact',
            'description_contains',
            'amount_exact',
            'amount_gt',
            'amount_lt',
            'date_lte',
            'date_gte',
            'from_savings',
            'is_transfer',
            'source_exact',
            'account',
        )

    def filter_is_transfer(self, queryset, value):
        return queryset.is_transfer(value)
