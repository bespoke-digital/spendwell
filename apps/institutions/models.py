
from django.db import models

from apps.core.models import MBOwnedModel


class Institution(MBOwnedModel):
    plaid_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

    @classmethod
    def get_serializer_class(Cls):
        from .serializers import InstitutionSerializer
        return InstitutionSerializer
