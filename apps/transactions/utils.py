
from difflib import SequenceMatcher

from django import forms
import graphene
from graphene.contrib.django.form_converter import convert_form_field
from graphql.core.type import (
    GraphQLInputObjectType,
    GraphQLInputObjectField,
    GraphQLObjectType,
    GraphQLField,
)

from apps.core.types import Money


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


def form_field_to_scalar(field):
    if isinstance(field, (forms.DecimalField, forms.FloatField)):
        return Money
    else:
        return convert_form_field(field)


def filter_list_schema(filterset_class, name=None, input=True):
    if name is None:
        name = filterset_class.__name__

    if input:
        ObjectType = graphene.InputObjectType
        ObjectField = graphene.InputField
    else:
        ObjectType = graphene.ObjectType
        ObjectField = graphene.Field

    Filter = type(name, (ObjectType,), {
        key: ObjectField(form_field_to_scalar(value.field))
        for key, value in filterset_class.base_filters.items()
    })

    return graphene.List(Filter)
