
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.core.models import SWModel, SWQuerySet, SWManager
from apps.core.signals import month_start
from apps.core.utils import this_month


class GoalsQuerySet(SWQuerySet):
    def sum(self, field='monthly_amount'):
        return super(GoalsQuerySet, self).sum(field)


class GoalManager(SWManager):
    queryset_class = GoalsQuerySet

    def create(self, **fields):
        goal = super(GoalManager, self).create(**fields)
        goal.generate_month()
        return goal


class Goal(SWModel):
    owner = models.ForeignKey('users.User', related_name='goals')
    name = models.CharField(max_length=255)
    monthly_amount = models.DecimalField(decimal_places=2, max_digits=12)

    objects = GoalManager()

    def __str__(self):
        return self.name

    def generate_month(self, month_start=None):
        if month_start is None:
            month_start = this_month()

        goal_month, created = GoalMonth.objects.update_or_create(
            goal=self,
            month_start=month_start,
            defaults={
                'target_amount': self.monthly_amount,
            },
        )

        return goal_month


@receiver(post_save, sender=Goal)
def goal_post_save(sender, instance, created, raw, **kwargs):
    if not raw:
        instance.generate_month()


class GoalMonthQueryset(SWQuerySet):
    def owned_by(self, user):
        return self.filter(goal__owner=user)


class GoalMonthManager(SWManager):
    queryset_class = GoalMonthQueryset


class GoalMonth(SWModel):
    goal = models.ForeignKey(Goal, related_name='months')
    month_start = models.DateTimeField()
    target_amount = models.DecimalField(decimal_places=2, max_digits=12)

    objects = GoalMonthManager()

    class Meta:
        unique_together = ('goal', 'month_start')


@receiver(month_start)
def on_month_start(sender, month, **kwargs):
    for goal in Goal.objects.all():
        goal.generate_month(month_start=month)
