
from graphene.contrib.django.fields import DjangoConnectionField
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode


class SWNode(DjangoNode):
    """
    Alternate version of DjangoNode which requires owner field to be
    equal to request.user.
    """

    class Meta:
        abstract = True

    @classmethod
    def get_node(Cls, id, info=None):
        if not info or not info.request_context.user.is_authenticated:
            return None

        try:
            instance = Cls._meta.model.objects.owned_by(info.request_context.user).get(id=id)
            return Cls(instance)
        except Cls._meta.model.DoesNotExist:
            return None


class SWConnectionMixin(object):
    def get_queryset(self, queryset, args, info):
        queryset = queryset.owned_by(info.request_context.user)
        if hasattr(self.type, 'get_queryset'):
            queryset = self.type.get_queryset(queryset, args, info)
        return super(SWConnectionMixin, self).get_queryset(queryset, args, info)


class SWConnectionField(SWConnectionMixin, DjangoConnectionField):
    pass


class SWFilterConnectionField(SWConnectionMixin, DjangoFilterConnectionField):
    pass
