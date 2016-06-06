
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.utils import to_snake_case
from graphql_relay import from_global_id
from graphene.utils import with_context

from apps.core.fields import SWConnectionMixin
from .filters import TransactionFilter
from .utils import apply_filter_list, filter_list_schema


TransactionsFiltersField = filter_list_schema(TransactionFilter)


class TransactionConnectionField(SWConnectionMixin, DjangoFilterConnectionField):
    def __init__(self, node_type, *args, **kwargs):
        kwargs['filterset_class'] = TransactionFilter
        kwargs['filters'] = TransactionsFiltersField
        super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

    def get_queryset(self, queryset, args, context, info):
        queryset = queryset.filter(owner=context.user)
        queryset = self.filterset_class(
            self.get_filter_kwargs(args),
            queryset=queryset,
        ).qs

        if args.get('filters'):
            filters = []
            for filter in args['filters']:
                for key, value in filter.items():
                    if key == 'account':
                        _, value = from_global_id(value)
                    filters.append({to_snake_case(key): value})

            queryset = apply_filter_list(queryset, filters, self.filterset_class)

        queryset = queryset.order_by(args.get('order_by', '-date'))
        queryset = queryset.distinct()

        return queryset

    @with_context
    def resolver(self, instance, args, context, info):
        schema = info.schema.graphene_schema
        connection_type = self.get_type(schema)

        connection_type.count = self.get_queryset(self.get_manager(), args, context, info).count()

        resolved = super(TransactionConnectionField, self).resolver(instance, args, context, info)

        if isinstance(resolved, connection_type):
            return resolved
        return self.from_list(connection_type, resolved, args, context, info)
