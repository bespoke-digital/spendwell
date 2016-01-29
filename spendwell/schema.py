
import graphene

from apps.categories.schema import CategoriesQuery
from apps.institutions.schema import InstitutionsQuery
from apps.accounts.schema import AccountsQuery
from apps.transactions.schema import TransactionsQuery


class Query(
    CategoriesQuery,
    InstitutionsQuery,
    AccountsQuery,
    TransactionsQuery,
):
    viewer = graphene.Field('self')
    node = graphene.relay.NodeField()

    def resolve_viewer(self, *args, **kwargs):
        return self


schema = graphene.Schema(name='SpendWell Schema')
schema.query = Query
