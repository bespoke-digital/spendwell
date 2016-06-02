
from graphene.contrib.django.fields import DjangoConnectionField
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode
from graphene.contrib.django.utils import maybe_queryset
from graphene.utils import with_context


class SWNode(DjangoNode):
    """
    Alternate version of DjangoNode which requires owner field to be
    equal to request.user.
    """

    class Meta:
        abstract = True

    @with_context
    @classmethod
    def get_node(Cls, id, context, info=None):
        if not info or not context or not context.user.is_authenticated:
            return None

        try:
            instance = Cls._meta.model.objects.owned_by(context.user).get(id=id)
            return Cls(instance)
        except Cls._meta.model.DoesNotExist:
            return None

    def resolve_djid(self, args, info):
        return self.instance.id


class SWConnectionMixin(object):
    def get_queryset(self, queryset, args, context, info):
        queryset = queryset.owned_by(context.user)
        if hasattr(self.type, 'get_queryset'):
            queryset = self.type.get_queryset(queryset, args, info)
        return super(SWConnectionMixin, self).get_queryset(queryset, args, info)

    @with_context
    def from_list(self, connection_type, resolved, args, context, info):
        "copied from graphene.contrib.django.fields to add context"
        resolved_qs = maybe_queryset(resolved)
        qs = self.get_queryset(resolved_qs, args, context, info)
        return super(DjangoConnectionField, self).from_list(connection_type, qs, args, context, info)


class SWConnectionField(SWConnectionMixin, DjangoConnectionField):
    pass


class SWFilterConnectionField(SWConnectionMixin, DjangoFilterConnectionField):
    pass
