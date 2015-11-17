
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, name=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=self.normalize_email(email), name=name)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, name):
        user = self.create_user(email, password=password, name=name)
        user.is_admin = True
        user.save()
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    @property
    def is_staff(self):
        return self.is_admin

    def __str__(self):
        if (self.name):
            return '{} <{}>'.format(self.name, self.email)
        else:
            return self.email

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

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
