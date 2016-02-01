
from django.db import models


class SWQuerySet(models.QuerySet):
    def as_serializer(self):
        return self.model.get_serializer_class()(self, many=True)

    def as_json(self):
        return self.as_serializer().as_json()

    def delete(self, **kwargs):
        for instance in self:
            instance.delete(**kwargs)


class SWManager(models.Manager):
    use_for_related_fields = True
    queryset_class = SWQuerySet

    def get_queryset(self):
        return self.queryset_class(self.model, using=self._db).filter(deleted=False)

    def as_serializer(self):
        return self.get_queryset().as_serializer()

    def as_json(self):
        return self.get_queryset().as_json()

    def delete(self, **kwargs):
        return self.get_queryset().delete(**kwargs)


class SWModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)

    objects = SWManager()

    class Meta:
        abstract = True

    def delete(self, hard=False):
        if hard:
            super(SWModel, self).delete()
        else:
            self.deleted = True
            self.save()

    @classmethod
    def get_serializer_class(Cls):
        raise NotImplementedError()

    def as_serializer(self):
        return self.get_serializer_class()(self)

    def as_json(self):
        return self.as_serializer().as_json()
