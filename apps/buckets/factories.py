
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory


class BucketFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'bucket {}'.format(n))

    class Meta:
        model = 'buckets.Bucket'
