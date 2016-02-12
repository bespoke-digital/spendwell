
import graphene
from graphene.utils import to_camel_case
from graphene.contrib.django.form_converter import convert_form_field
from graphql.core.type import GraphQLInputObjectType, GraphQLInputObjectField

from apps.core.utils import get_core_type
from difflib import SequenceMatcher


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def apply_filter_list(base_queryset, filter_list, filter_class):
    if len(filter_list) == 0:
        return base_queryset

    queryset = None
    for filter in filter_list:
        next_queryset = filter_class(filter, queryset=base_queryset).qs

        if queryset is None:
            queryset = next_queryset
        else:
            queryset = queryset | next_queryset

    return queryset


def filter_list_schema(filterset_class, name=None):
    if name is None:
        name = filterset_class.__name__

    return graphene.List(GraphQLInputObjectType(name, {
        to_camel_case(key): GraphQLInputObjectField(get_core_type(convert_form_field(value.field)))
        for key, value in filterset_class.base_filters.items()
    }))
