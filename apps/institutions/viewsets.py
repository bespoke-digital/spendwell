
from rest_framework import viewsets

from apps.core.viewsets import MBOwnedViewSetMixin

from .models import Institution
from .serializers import InstitutionSerializer


class InstitutionViewSet(MBOwnedViewSetMixin, viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
