
from django.db import models


class SWQuerySet(models.QuerySet):
    def as_serializer(self):
        return self.model.get_serializer_class()(self, many=True)

    def as_json(self):
        return self.as_serializer().as_json()

    def sum(self, field):
        return self.aggregate(s=models.Sum(field))['s'] or 0


class SWManager(models.Manager):
    use_for_related_fields = True
    queryset_class = SWQuerySet

    def get_queryset(self):
        return self.queryset_class(self.model, using=self._db)

    def as_serializer(self):
        return self.get_queryset().as_serializer()

    def as_json(self):
        return self.get_queryset().as_json()

    def sum(self):
        return self.get_queryset().sum()


class SWModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    objects = SWManager()

    class Meta:
        abstract = True

    @classmethod
    def get_serializer_class(Cls):
        raise NotImplementedError()

    def as_serializer(self):
        return self.get_serializer_class()(self)

    def as_json(self):
        return self.as_serializer().as_json()
