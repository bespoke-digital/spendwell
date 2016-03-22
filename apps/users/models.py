
from uuid import uuid4
from dateutil.relativedelta import relativedelta

from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from delorean import Delorean

from apps.core.utils import months_ago, this_month


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
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    finicity_id = models.CharField(max_length=255, null=True, blank=True)
    estimated_income = models.DecimalField(decimal_places=2, max_digits=12, default=0)

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

    def estimate_income(self):
        current_month = this_month()
        income_months = [
            self.transactions
            .filter(amount__gt=0)
            .filter(account__disabled=False)
            .filter(date__lt=current_month - relativedelta(months=i))
            .filter(date__gte=current_month - relativedelta(months=i + 1))
            .is_transfer(False)
            .sum()
            for i in range(months_ago(self.first_data_month()) - 1)
        ]
        self.estimated_income = min(income_months)

    def first_data_month(self):
        first_transaction = self.transactions.order_by('date').first()
        if not first_transaction:
            return self.created
        else:
            return Delorean(first_transaction.date).truncate('month').datetime


def get_beta_code():
    return uuid4().hex


class BetaCode(models.Model):
    key = models.CharField(max_length=255, default=get_beta_code)
    used_by = models.OneToOneField(User, blank=True, null=True)
