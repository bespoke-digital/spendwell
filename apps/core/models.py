
from django.db import models


class MBQuerySet(models.QuerySet):
    def as_serializer(self):
        return self.model.get_serializer_class()(self, many=True)

    def as_json(self):
        return self.as_serializer().as_json()

    def delete(self, **kwargs):
        for instance in self:
            instance.delete(**kwargs)


class MBManager(models.Manager):
    def get_queryset(self):
        return MBQuerySet(self.model, using=self._db).filter(deleted=False)

    def as_serializer(self):
        return self.get_queryset().as_serializer()

    def as_json(self):
        return self.get_queryset().as_json()

    def delete(self, **kwargs):
        return self.get_queryset().delete(**kwargs)


class MBModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)

    objects = MBManager()

    class Meta:
        abstract = True

    def delete(self, hard=False):
        if hard:
            super(MBModel, self).delete()
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


class MBOwnedModel(MBModel):
    owner = models.ForeignKey('users.User')

    class Meta:
        abstract = True
