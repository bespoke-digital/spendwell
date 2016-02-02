
from datetime import datetime
from decimal import Decimal

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
        oldest = Transaction.objects.filter(amount__gt=0).order_by('date').first()
        if not oldest:
            return 0

        months_ago = relativedelta(month_start, oldest.date).months
        if months_ago > 3:
            months_ago = 3

        if months_ago == 0:
            return Transaction.objects.filter(
                transfer_to__isnull=True,
                amount__gt=0
            ).aggregate(models.Sum('amount'))['amount__sum'] or 0
        else:
            transactions = [
                Transaction.objects.filter(
                    owner=self,
                    date__lt=month_start - relativedelta(months=month),
                    date__gte=month_start - relativedelta(months=month + 1),
                    transfer_to__isnull=True,
                    amount__gt=0,
                ).aggregate(models.Sum('amount'))['amount__sum'] or 0
                for month in range(months_ago)
            ]

            return Decimal(sum(transactions)) / Decimal(len(transactions))

    def safe_to_spend(self):
        now = timezone.now()
        month_start = timezone.make_aware(datetime(
            year=now.year,
            month=now.month,
            day=1,
        ))

        spent = (
            Transaction.objects
            .filter(transfer_to__isnull=True)
            .filter(date__gte=month_start)
            .filter(amount__lt=0)
            .aggregate(models.Sum('amount'))
            ['amount__sum'] or 0
        )

        # TODO: calculate from Goals
        saved = 0

        income = self.income(month_start)

        return (income - saved) + spent
