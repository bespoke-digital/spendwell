
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory
from .models import Institution


class InstitutionFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'Institution {}'.format(n))

    class Meta:
        model = Institution
