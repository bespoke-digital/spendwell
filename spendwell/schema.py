
import graphene

from apps.categories.schema import CategoriesQuery
from apps.institutions.schema import InstitutionsQuery
from apps.accounts.schema import AccountsQuery
from apps.transactions.schema import TransactionsQuery
from apps.users.schema import UsersQuery
from apps.goals.schema import GoalsQuery
from apps.buckets.schema import BucketsQuery

from apps.institutions.mutations import InstitutionsMutations
from apps.accounts.mutations import AccountsMutations
from apps.transactions.mutations import TransactionsMutations
from apps.goals.mutations import GoalsMutations
from apps.buckets.mutations import BucketsMutations


class Viewer(
    graphene.relay.Node,
    CategoriesQuery,
    InstitutionsQuery,
    AccountsQuery,
    TransactionsQuery,
    UsersQuery,
    GoalsQuery,
    BucketsQuery,
):
    @classmethod
    def get_node(Cls, args, info):
        return Cls()


class Query(graphene.ObjectType):
    node = graphene.relay.NodeField()
    viewer = graphene.Field(Viewer)

    def resolve_viewer(self, *args, **kwargs):
        return Viewer()


class Mutations(
    InstitutionsMutations,
    AccountsMutations,
    TransactionsMutations,
    GoalsMutations,
    BucketsMutations,
):
    pass


schema = graphene.Schema(
    name='SpendWell Schema',
    query=Query,
    mutation=Mutations,
)
