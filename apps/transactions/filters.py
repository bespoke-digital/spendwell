
import django_filters as filters

from apps.categories.models import Category

from .models import Transaction


class TransactionFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_type='icontains')
    category = filters.MethodFilter()
    date_lte = filters.DateTimeFilter(name='date', lookup_type='lte')
    date_gte = filters.DateTimeFilter(name='date', lookup_type='gte')
    time_lte = filters.MethodFilter()
    time_gte = filters.MethodFilter()
    inflow = filters.MethodFilter()

    class Meta:
        model = Transaction
        fields = [
            'name',
            'category',
            'date_lte',
            'date_gte',
            'time_lte',
            'time_gte',
            # 'address_city',
            # 'address_street',
            # 'address_state',
            # 'account',
        ]

    def filter_category(self, queryset, value):
        category = Category.objects.get(id=value)
        return queryset.filter(category__in=[category] + category.all_children())

    def filter_time_lte(self, queryset, value):
        hour, minute = value.split(':')
        return queryset.filter(date__hour__lte=hour, date__minute__lte=minute)

    def filter_time_gte(self, queryset, value):
        hour, minute = value.split(':')
        return queryset.filter(date__hour__gte=hour, date__minute__gte=minute)

    def filter_inflow(self, queryset, value):
        if value.lower() == 'true':
            return queryset.filter(amount__lt=0)
        else:
            return queryset.filter(amount__gt=0)
