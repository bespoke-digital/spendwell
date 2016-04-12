
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.utils import to_snake_case

from apps.core.fields import SWConnectionMixin
from .filters import TransactionFilter
from .utils import apply_filter_list, filter_list_schema


TransactionsFiltersField = filter_list_schema(TransactionFilter)


class TransactionConnectionField(SWConnectionMixin, DjangoFilterConnectionField):
    def __init__(self, node_type, *args, **kwargs):
        kwargs['filterset_class'] = TransactionFilter
        kwargs['filters'] = TransactionsFiltersField
        super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

    def get_queryset(self, queryset, args, info):
        queryset = queryset.filter(owner=info.request_context.user)
        queryset = self.filterset_class(
            self.get_filter_kwargs(args),
            queryset=queryset,
        ).qs

        if args.get('filters'):
            filters = [
                {to_snake_case(k): v for k, v in f.items()}
                for f in args['filters']
            ]
            queryset = apply_filter_list(queryset, filters, self.filterset_class)

        queryset = queryset.order_by(args.get('order_by', '-date'))
        queryset = queryset.distinct()

        return queryset

    def resolver(self, instance, args, info):
        schema = info.schema.graphene_schema
        connection_type = self.get_type(schema)

        connection_type.count = self.get_queryset(self.get_manager(), args, info).count()

        resolved = super(TransactionConnectionField, self).resolver(instance, args, info)

        if isinstance(resolved, connection_type):
            return resolved
        return self.from_list(connection_type, resolved, args, info)
