
from graphene import relay, ObjectType
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode
import django_filters

from .models import Category


class CategoryFilter(django_filters.FilterSet):
    parent_exists = django_filters.BooleanFilter(
        name='parent',
        lookup_type='isnull',
    )

    class Meta:
        model = Category
        fields = ['parent_exists']
        order_by = ['name']


class CategoryNode(DjangoNode):
    class Meta:
        model = Category
        filter_order_by = ['name']


class CategoriesQuery(ObjectType):
    category = relay.NodeField(CategoryNode)
    categories = DjangoFilterConnectionField(
        CategoryNode,
        filterset_class=CategoryFilter,
    )

    class Meta:
        abstract = True
