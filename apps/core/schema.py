
from graphene.contrib.django.fields import DjangoConnectionField
from graphene.contrib.django.types import DjangoNode


class OwnedNode(DjangoNode):
    """
    Alternate version of DjangoNode which requires owner field to be
    equal to request.user.
    """

    class Meta:
        abstract = True

    @classmethod
    def get_node(cls, id, info=None):
        if not info or not info.request_context.user.is_authenticated:
            return None

        try:
            instance = cls._meta.model.objects.get(
                owner=info.request_context.user,
                id=id,
            )
            return cls(instance)
        except cls._meta.model.DoesNotExist:
            return None


class OwnedConnectionField(DjangoConnectionField):
    def get_queryset(self, queryset, args, info):
        queryset = queryset.filter(owner=info.request_context.user)
        return super(OwnedConnectionField, self).get_queryset(queryset, args, info)
