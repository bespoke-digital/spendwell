
from rest_framework import viewsets

from apps.core.viewsets import SWOwnedViewSetMixin

from .models import Bucket
from .serializers import BucketSerializer


class BucketViewSet(SWOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Bucket.objects.all()
    serializer_class = BucketSerializer
