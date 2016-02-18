
import delorean
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory


class BucketFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'bucket {}'.format(n))

    class Meta:
        model = 'buckets.Bucket'


class BucketMonthFactory(DjangoModelFactory):
    bucket = factory.SubFactory(BucketFactory)
    month_start = delorean.now().truncate('month').datetime

    class Meta:
        model = 'buckets.BucketMonth'
