
from .permissions import SWOwnedPermission


class SWOwnedViewSetMixin(object):
    permission_classes = (SWOwnedPermission,)

    def get_queryset(self):
        queryset = super(SWOwnedViewSetMixin, self).get_queryset()
        queryset = queryset.filter(owner=self.request.user)
        return queryset
