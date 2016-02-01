
from django.db import models
from django.core.exceptions import SuspiciousOperation
from django.contrib.postgres.fields import JSONField

from apps.core.models import SWModel, SWManager, SWQuerySet
from apps.transactions.models import Transaction


class BucketQuerySet(SWQuerySet):
    def assign(self, transaction):
        for bucket in self:
            if transaction in bucket.filter_transactions():
                if bucket.owner is not transaction.owner:
                    raise SuspiciousOperation(
                        'bucket owner does not match transaction owner'
                    )

                transaction.bucket = bucket
                transaction.save()
                break


class BucketManager(SWManager):
    queryset_class = BucketQuerySet

    def assign(self, *args, **kwargs):
        return self.get_queryset().assign(*args, **kwargs)


class Bucket(SWModel):
    owner = models.ForeignKey('users.User', related_name='buckets')
    name = models.CharField(max_length=255)
    filters = JSONField(default=list)

    objects = BucketManager()

    def __str__(self):
        return self.name

    def filter_transactions(self):
        queryset = Transaction.objects.filter(owner=self.owner)

        for filter in self.filters:
            if filter['type'] == 'description':
                queryset = queryset.filter(description__icontains=filter['value'])

        return queryset
