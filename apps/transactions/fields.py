
from graphene.contrib.django.filter import DjangoFilterConnectionField

from .utils import apply_filter_list, filter_list_schema


class TransactionConnectionField(DjangoFilterConnectionField):
    def __init__(self, node_type, *args, **kwargs):
        filterset_class = kwargs.get('filterset_class')
        if filterset_class is None:
            return super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

        kwargs['filters'] = filter_list_schema(filterset_class)

        super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

    def get_queryset(self, queryset, args, info):
        queryset = queryset.filter(owner=info.request_context.user)

        if not args.get('filters'):
            return super(TransactionConnectionField, self).get_queryset(queryset, args, info)

        queryset = self.filterset_class(args, queryset=queryset)

        return apply_filter_list(queryset, args['filters'], self.filterset_class)
