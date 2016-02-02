
import graphene

from apps.categories.schema import CategoriesQuery
from apps.institutions.schema import InstitutionsQuery
from apps.accounts.schema import AccountsQuery
from apps.transactions.schema import TransactionsQuery
from apps.users.schema import UsersQuery


class Viewer(
    CategoriesQuery,
    InstitutionsQuery,
    AccountsQuery,
    TransactionsQuery,
    UsersQuery,
):
    pass


class Query(graphene.ObjectType):
    node = graphene.relay.NodeField()
    viewer = graphene.Field(Viewer)

    def resolve_viewer(self, *args, **kwargs):
        return Viewer()


schema = graphene.Schema(name='SpendWell Schema')
schema.query = Query
