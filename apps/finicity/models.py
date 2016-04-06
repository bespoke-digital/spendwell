
from django.db import models


class FinicityInstitution(models.Model):
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    finicity_id = models.CharField(max_length=255)
    color = models.CharField(max_length=7, default='#000000')
    image = models.ImageField(
        upload_to='finicity/institutions',
        null=True, blank=True,
    )
