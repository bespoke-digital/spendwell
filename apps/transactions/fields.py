
from graphene.contrib.django.filter import DjangoFilterConnectionField

from .filters import TransactionFilter
from .utils import apply_filter_list, filter_list_schema


class TransactionConnectionField(DjangoFilterConnectionField):
    def __init__(self, node_type, *args, **kwargs):
        kwargs['filterset_class'] = TransactionFilter
        kwargs['filters'] = filter_list_schema(
            TransactionFilter,
            name=kwargs.pop('filters_name', None),
        )
        super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

    def get_queryset(self, queryset, args, info):
        queryset = queryset.filter(owner=info.request_context.user)

        if hasattr(self.type, 'get_queryset'):
            queryset = self.type.get_queryset(queryset, args, info)

        queryset = self.filterset_class(args, queryset=queryset).qs

        if not args.get('filters'):
            return queryset
        else:
            result = apply_filter_list(queryset, args['filters'], self.filterset_class)
        return result
