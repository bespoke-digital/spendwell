
import graphene

from apps.categories.schema import CategoriesQuery
from apps.institutions.schema import InstitutionsQuery
from apps.institutions.mutations import InstitutionsMutations
from apps.accounts.schema import AccountsQuery
from apps.accounts.mutations import AccountsMutations
from apps.transactions.schema import TransactionsQuery
from apps.transactions.mutations import TransactionsMutations
from apps.users.schema import UsersQuery
from apps.users.mutations import UsersMutations
from apps.goals.schema import GoalsQuery
from apps.goals.mutations import GoalsMutations
from apps.buckets.schema import BucketsQuery
from apps.buckets.mutations import BucketsMutations
from apps.finicity.schema import FinicityQuery
from apps.finicity.mutations import FinicityMutations


class Viewer(
    graphene.relay.Node,
    CategoriesQuery,
    InstitutionsQuery,
    AccountsQuery,
    TransactionsQuery,
    UsersQuery,
    GoalsQuery,
    BucketsQuery,
    FinicityQuery,
):
    dummy = graphene.Field(graphene.String())

    @classmethod
    def get_node(Cls, id, info):
        return Cls()

    def to_global_id(self):
        return self.global_id(1)

    def resolve_dummy(self, args, info):
        return ''


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
    UsersMutations,
    FinicityMutations,
):
    pass


schema = graphene.Schema(
    name='SpendWell Schema',
    query=Query,
    mutation=Mutations,
)
