
import graphene
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.fields import DjangoConnectionField
from graphene.contrib.django.types import DjangoNode
import django_filters

from .models import Category


class CategoryFilter(django_filters.FilterSet):
    top_level = django_filters.BooleanFilter(
        name='parent',
        lookup_type='isnull',
    )

    class Meta:
        model = Category
        fields = ['top_level', 'name']
        order_by = ['name']


class CategoryNode(DjangoNode):
    child_count = graphene.IntField()

    class Meta:
        model = Category
        filter_order_by = ['name']
        only_fields = (
            'child_count',
            'children',
            'name',
            'id',
        )

    def resolve_child_count(self, args, info):
        return self.instance.children.count()


class CategoriesQuery(graphene.ObjectType):
    category = graphene.relay.NodeField(CategoryNode)
    categories = DjangoConnectionField(
        CategoryNode,
        name=graphene.String(),
    )

    class Meta:
        abstract = True

    def resolve_categories(self, args, info):
        if args['name']:
            return Category.objects.filter(name__icontains=args['name'])
        else:
            return Category.objects.all()
