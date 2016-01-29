
import graphene


class UsersQuery(graphene.ObjectType):
    safe_to_spend = graphene.Int()
    income = graphene.Int()

    class Meta:
        abstract = True

    def resolve_safe_to_spend(self, args, info):
        return 0

    def resolve_income(self, args, info):
        return 0
