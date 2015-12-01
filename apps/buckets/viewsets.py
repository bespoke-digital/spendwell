
from rest_framework import viewsets

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Bucket
from .serializers import BucketSerializer


class BucketViewSet(MBOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Bucket.objects.all()
    serializer_class = BucketSerializer
