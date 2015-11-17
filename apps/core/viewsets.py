
from rest_framework import permissions


class MBViewSetMixin(object):
    permission_classes = (permissions.IsAuthenticated,)
