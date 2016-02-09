
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory
from .models import Goal


class GoalFactory(DjangoModelFactory):
    owner = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: 'Goal {}'.format(n))
    monthly_amount = factory.Sequence(lambda n: n * 100)

    class Meta:
        model = Goal
