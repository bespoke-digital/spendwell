
from django.db import models

from apps.core.models import MBOwnedModel


class Bucket(MBOwnedModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
