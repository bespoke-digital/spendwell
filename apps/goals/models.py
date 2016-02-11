
import delorean
from django.db import models

from apps.core.models import SWModel, SWQuerySet, SWManager


class GoalsQuerySet(SWQuerySet):
    def sum(self, field='monthly_amount'):
        return super(GoalsQuerySet, self).sum(field)


class GoalManager(SWManager):
    queryset_class = GoalsQuerySet

    def create(self, **fields):
        goal = super(GoalManager, self).create(**fields)
        GoalMonth.objects.generate(goal, delorean.now().truncate('month').datetime)
        return goal


class Goal(SWModel):
    owner = models.ForeignKey('users.User', related_name='goals')
    name = models.CharField(max_length=255)
    monthly_amount = models.DecimalField(decimal_places=2, max_digits=12)

    objects = GoalManager()

    def __str__(self):
        return self.name


class GoalMonthManager(SWManager):
    def generate(self, goal, month_start):
        available_amount = goal.owner.summary(month_start)['net']
        if available_amount < goal.monthly_amount:
            filled_amount = -available_amount
        else:
            filled_amount = goal.monthly_amount

        return self.model.objects.create(
            goal=goal,
            month_start=month_start,
            target_amount=goal.monthly_amount,
            filled_amount=filled_amount,
        )


class GoalMonth(SWModel):
    goal = models.ForeignKey(Goal, related_name='months')
    month_start = models.DateTimeField()
    target_amount = models.DecimalField(decimal_places=2, max_digits=12)
    filled_amount = models.DecimalField(decimal_places=2, max_digits=12)

    objects = GoalMonthManager()

    class Meta:
        unique_together = ('goal', 'month_start')
