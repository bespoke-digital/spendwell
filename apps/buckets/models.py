
from django.db import models

from apps.core.models import MBOwnedModel


class Bucket(MBOwnedModel):
    name = models.CharField(max_length=255)
    monthly_amount = models.DecimalField(decimal_places=2, max_digits=8)
    autofill = models.BooleanField(default=True)

    def __str__(self):
        return self.name
