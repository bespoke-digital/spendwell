
from .permissions import MBOwnedPermission


class MBOwnedViewSetMixin(object):
    permission_classes = (MBOwnedPermission,)
