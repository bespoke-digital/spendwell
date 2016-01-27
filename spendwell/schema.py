
from graphene import Schema

from apps.categories.schema import CategoriesQuery


class Query(CategoriesQuery):
    pass


schema = Schema(name='SpendWell Schema')
schema.query = Query
