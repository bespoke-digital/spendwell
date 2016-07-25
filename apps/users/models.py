
import logging
from uuid import uuid4

from django.core.signing import Signer
from django.db import models
from django.conf import settings
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from delorean import Delorean

from apps.core.utils.email import send_email


logger = logging.getLogger(__name__)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=self.normalize_email(email), **kwargs)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **kwargs):
        user = self.create_user(email, password=password, **kwargs)
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
    last_sync = models.DateTimeField(null=True, blank=True)

    finicity_id = models.CharField(max_length=255, null=True, blank=True)
    yodlee_password = models.CharField(max_length=255, null=True, blank=True)

    estimated_income = models.DecimalField(decimal_places=2, max_digits=12, default=0)
    timezone = models.CharField(max_length=100, default='America/Toronto')
    estimated_income_confirmed = models.BooleanField(default=False)

    dashboard_help = models.BooleanField(default=True)
    create_label_help = models.BooleanField(default=True)
    create_bill_help = models.BooleanField(default=True)
    create_goal_help = models.BooleanField(default=True)

    email_subscribed = models.BooleanField(default=True)

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

    def first_data_month(self):
        first_transaction = self.transactions.order_by('date').first()
        if not first_transaction:
            return self.created
        else:
            return Delorean(first_transaction.date).truncate('month').datetime


def get_beta_code():
    return uuid4().hex


class AuthToken(models.Model):
    user = models.ForeignKey('users.User')
    token = models.CharField(max_length=255)
    device_type = models.CharField(max_length=255)
    device_name = models.CharField(max_length=255)

    @classmethod
    def generate(Cls, user, **kwargs):
        token = Signer().sign('{}:{}'.format(user.id, uuid4().hex[:5]))
        return AuthToken.objects.create(user=user, token=token, **kwargs)


class BetaSignup(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    beta_code = models.OneToOneField(
        'users.BetaCode',
        related_name='beta_signup',
        blank=True,
        null=True,
    )

    def invited(self):
        return bool(self.beta_code) or User.objects.filter(email=self.email).exists()
    invited.boolean = True

    def used(self):
        return bool(
            (self.beta_code and self.beta_code.used) or
            User.objects.filter(email=self.email).exists()
        )
    used.boolean = True

    def invite_user(self, email=False):
        if self.beta_code:
            return False

        self.beta_code = BetaCode.objects.create(intended_for=self.email)
        self.save()

        if email:
            send_email(
                subject="You're invited to join Spendwell",
                user=self,
                template='users/email/beta-invite.html',
                context={'invite_url': self.beta_code.invite_url},
            )

        return True


class BetaCode(models.Model):
    key = models.CharField(max_length=255, default=get_beta_code)
    intended_for = models.CharField(max_length=255, blank=True, default='')
    used_by = models.OneToOneField(User, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    used = models.DateTimeField(null=True, blank=True)

    def invite_url(self):
        return 'https://{}/signup?beta-code={}'.format(settings.SITE_DOMAIN, self.key)
