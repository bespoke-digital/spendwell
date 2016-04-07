
import django_filters as filters

from .models import Bucket


class BucketFilter(filters.FilterSet):
    type = filters.CharFilter(name='type', lookup_type='exact')
    name_exact = filters.CharFilter(name='name', lookup_type='iexact')
    name_contains = filters.CharFilter(name='name', lookup_type='icontains')

    class Meta:
        model = Bucket
        fields = (
            'type',
            'name_exact',
            'name_contains',
        )
