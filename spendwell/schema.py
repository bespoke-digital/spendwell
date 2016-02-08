
import graphene

from apps.categories.schema import CategoriesQuery
from apps.institutions.schema import InstitutionsQuery
from apps.institutions.mutations import InstitutionsMutations
from apps.accounts.schema import AccountsQuery
from apps.accounts.mutations import AccountsMutations
from apps.transactions.schema import TransactionsQuery
from apps.transactions.mutations import TransactionsMutations
from apps.users.schema import UsersQuery


class Viewer(
    CategoriesQuery,
    InstitutionsQuery,
    AccountsQuery,
    TransactionsQuery,
    UsersQuery,
):
    id = graphene.ID()

    def resolve_id(self, args, info):
        return info.request_context.user.id


class Query(graphene.ObjectType):
    node = graphene.relay.NodeField()
    viewer = graphene.Field(Viewer)

    def resolve_viewer(self, *args, **kwargs):
        return Viewer()


class Mutations(
    InstitutionsMutations,
    AccountsMutations,
    TransactionsMutations,
):
    pass


schema = graphene.Schema(
    name='SpendWell Schema',
    query=Query,
    mutation=Mutations,
)
