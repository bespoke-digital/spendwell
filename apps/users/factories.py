
import factory
from factory.django import DjangoModelFactory

from .models import User


class UserFactory(DjangoModelFactory):
    email = factory.Sequence(lambda n: 'user+{}@example.com'.format(n))

    class Meta:
        model = User
