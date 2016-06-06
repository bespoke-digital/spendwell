
import logging
from uuid import uuid4
from dateutil.relativedelta import relativedelta

from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.dispatch import receiver
from django.conf import settings
from delorean import Delorean

from apps.core.signals import day_start
from apps.core.utils import months_ago, this_month
from apps.core.utils.email import send_email
from apps.buckets.models import Bucket
from apps.transactions.models import Transaction

try:
    from raven.contrib.django.raven_compat.models import client as raven
except ImportError:
    raven = None


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

    finicity_id = models.CharField(max_length=255, null=True, blank=True)
    estimated_income = models.DecimalField(decimal_places=2, max_digits=12, default=0)

    timezone = models.CharField(max_length=100, default='America/Toronto')
    estimated_income_confirmed = models.BooleanField(default=False)

    dashboard_help = models.BooleanField(default=True)
    create_label_help = models.BooleanField(default=True)
    create_bill_help = models.BooleanField(default=True)
    create_goal_help = models.BooleanField(default=True)

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
        if len(income_months) > 0:
            self.estimated_income = min(income_months)
        else:
            self.estimated_income = 0

    def first_data_month(self):
        first_transaction = self.transactions.order_by('date').first()
        if not first_transaction:
            return self.created
        else:
            return Delorean(first_transaction.date).truncate('month').datetime

    def sync(self):
        for institution in self.institutions.all():
            institution.sync()

        Transaction.objects.detect_transfers(owner=self)

        for bucket in Bucket.objects.filter(owner=self):
            bucket.assign_transactions()


@receiver(day_start)
def on_day_start(*args, **kwargs):
    for user in User.objects.all():
        try:
            user.sync()
        except:
            if raven is not None:
                raven.captureException()

            # Don't fail on exceptions so one bad FI doesn't kill an entire sync
            logger.exception('Exception occurred while syncing {}'.format(user.id))


def get_beta_code():
    return uuid4().hex


class BetaSignup(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    beta_code = models.OneToOneField('users.BetaCode', blank=True, null=True, related_name='beta_signup')

    def invited(self):
        return bool(self.beta_code) or User.objects.filter(email=self.email).exists()
    invited.boolean = True

    def used(self):
        return (
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
                to=self.email,
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
        return 'https://{}/signup?beta-code={}'.format(settings.ALLOWED_HOSTS[0], self.key)
