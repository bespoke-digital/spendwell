
from .permissions import MBOwnedPermission


class MBOwnedViewSetMixin(object):
    permission_classes = (MBOwnedPermission,)

    def get_queryset(self):
        queryset = super(MBOwnedViewSetMixin, self).get_queryset()
        queryset = queryset.filter(owner=self.request.user)
        return queryset
