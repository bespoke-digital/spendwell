
import django_filters as filters

from .models import Account


class AccountFilter(filters.FilterSet):
    class Meta:
        model = Account
        fields = (
            'disabled',
        )
