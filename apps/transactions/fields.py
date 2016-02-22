
import graphene
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.relay.types import Connection

from apps.core.fields import SWConnectionMixin
from .filters import TransactionFilter
from .utils import apply_filter_list, filter_list_schema


TransactionsFiltersField = filter_list_schema(TransactionFilter)


class TransactionConnection(Connection):
    count = graphene.Int()


class TransactionConnectionField(SWConnectionMixin, DjangoFilterConnectionField):
    def __init__(self, node_type, *args, **kwargs):
        kwargs['filterset_class'] = TransactionFilter
        kwargs['filters'] = TransactionsFiltersField
        kwargs['connection_type'] = TransactionConnection
        super(TransactionConnectionField, self).__init__(node_type, *args, **kwargs)

    def get_queryset(self, queryset, args, info):
        queryset = super(TransactionConnectionField, self).get_queryset(queryset, args, info)

        if args.get('filters'):
            queryset = apply_filter_list(queryset, args['filters'], self.filterset_class)

        return queryset

    def resolver(self, instance, args, info):
        schema = info.schema.graphene_schema
        connection_type = self.get_type(schema)
        connection_type.count = len(self.get_queryset(None, args, info))

        resolved = super(TransactionConnectionField, self).resolver(instance, args, info)

        if isinstance(resolved, connection_type):
            return resolved
        return self.from_list(connection_type, resolved, args, info)
