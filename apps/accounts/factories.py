
from django.utils.timezone import now
import factory
from factory.django import DjangoModelFactory

from apps.institutions.factories import InstitutionFactory
from apps.users.factories import UserFactory
from .models import Account


class AccountFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    institution = factory.SubFactory(InstitutionFactory)
    last_updated = factory.LazyAttribute(lambda o: now())
    balance_available = factory.Sequence(lambda n: n * 1323)
    balance_current = factory.Sequence(lambda n: (n * 1323) - 300)

    class Meta:
        model = Account
