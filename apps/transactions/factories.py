
from django.utils.timezone import now
import factory
from factory.django import DjangoModelFactory

from apps.accounts.factories import AccountFactory
from apps.users.factories import UserFactory
from .models import Transaction


class TransactionFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    account = factory.SubFactory(AccountFactory)
    description = factory.Sequence(lambda n: 'Transaction {}'.format(n))
    amount = factory.Sequence(lambda n: -102 * n)
    date = factory.LazyAttribute(lambda o: now())

    class Meta:
        model = Transaction
