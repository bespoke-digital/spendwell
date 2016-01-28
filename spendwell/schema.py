
import graphene

from apps.categories.schema import CategoriesQuery


class Query(CategoriesQuery):
    viewer = graphene.Field('self')

    def resolve_viewer(self, *args, **kwargs):
        return self


schema = graphene.Schema(name='SpendWell Schema')
schema.query = Query
