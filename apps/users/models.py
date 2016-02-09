
from datetime import datetime
from uuid import uuid4

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from dateutil.relativedelta import relativedelta

from apps.transactions.models import Transaction


class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password=password)
        user.is_admin = True
        user.save()
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    estimated_income = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        default=0,
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'

    @property
    def is_staff(self):
        return self.is_admin

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @classmethod
    def get_serializer_class(Cls):
        from .serializers import UserSerializer
        return UserSerializer

    def as_serializer(self):
        return self.get_serializer_class()(self)

    def as_json(self):
        return self.as_serializer().as_json()

    def income(self, month_start):
        income = Transaction.objects.filter(
            owner=self,
            transfer_to__isnull=True,
            date__lt=month_start + relativedelta(months=1),
            date__gte=month_start,
            amount__gt=0,
        ).sum()

        if (
            relativedelta(month_start, timezone.now()).months == 0 and
            income < self.estimated_income
        ):
            return self.estimated_income
        else:
            return income

    def allocated(self, month_start):
        # TODO
        return 0

    def spent(self, month_start):
        return Transaction.objects.filter(
            owner=self,
            transfer_to__isnull=True,
            date__gte=month_start,
            date__lt=month_start + relativedelta(months=1),
            amount__lt=0,
        ).sum()

    def summary(self, month_start):
        income = self.income(month_start)
        allocated = self.allocated(month_start)
        spent = self.spent(month_start)
        return {
            'income': income,
            'allocated': allocated,
            'spent': spent,
            'net': sum([income, allocated, spent]),
        }

    def safe_to_spend(self):
        now = timezone.now()
        month_start = timezone.make_aware(datetime(
            year=now.year,
            month=now.month,
            day=1,
        ))
        return self.summary(month_start)['net']


class BetaCode(models.Model):
    key = models.CharField(max_length=255, default=uuid4)
    used_by = models.OneToOneField(User, blank=True, null=True)
