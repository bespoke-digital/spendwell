
import graphene
from graphene.utils import with_context

from .client import Yodlee


class YodleeFastlinkType(graphene.ObjectType):
    url = graphene.Field(graphene.String())
    parameters = graphene.Field(graphene.String())


class YodleeQuery(graphene.ObjectType):
    yodlee_fastlink = graphene.Field(YodleeFastlinkType)

    class Meta:
        abstract = True

    @with_context
    def resolve_yodlee_fastlink(self, args, context, info):
        return YodleeFastlinkType(**Yodlee(context.user).get_fastlink())
