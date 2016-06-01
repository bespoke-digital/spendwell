
from django.db import models
from django.conf import settings

from plaid import Client

if settings.PLAID_PRODUCTION:
    Client.config({'url': 'https://api.plaid.com'})
else:
    Client.config({'url': 'https://tartan.plaid.com'})


class SWQuerySet(models.QuerySet):
    def sum(self, field):
        return self.aggregate(s=models.Sum(field))['s'] or 0

    def owned_by(self, user):
        return self.filter(owner=user)


class SWManager(models.Manager):
    use_for_related_fields = True
    queryset_class = SWQuerySet

    def get_queryset(self):
        return self.queryset_class(self.model, using=self._db)

    def sum(self, *args, **kwargs):
        return self.get_queryset().sum(*args, **kwargs)

    def owned_by(self, *args, **kwargs):
        return self.get_queryset().owned_by(*args, **kwargs)


class SWModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    objects = SWManager()

    class Meta:
        abstract = True


class LoadingQuote(models.Model):
    author = models.CharField(max_length=255)
    quote = models.TextField()

    def __str__(self):
        return self.author
