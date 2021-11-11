from django.db import models

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.mail import send_mail


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **kwargs):
        """
        Create and return a `User` with an email, password  and institute
        """
        if email is None:
            raise TypeError('Users must have an email.')

        email = self.normalize_email(email)
        user = self.model(email=email, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **kwargs):
        """
        Create and return a `User` with superuser (admin) permissions.
        """
        if password is None:
            raise TypeError('Superusers must have a password.')
        if email is None:
            raise TypeError('Superusers must have an email.')

        kwargs.setdefault('is_staff', True)
        kwargs.setdefault('is_superuser', True)
        kwargs.setdefault('is_active', True)

        user = self.create_user(email, password, **kwargs)
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(db_index=True, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    institute = models.CharField(db_index=True, max_length=255, unique=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def email_user(self, subject, message, from_email=None, **kwargs):
        # Sends an email to this User.

        send_mail(subject, message, from_email, [self.email], **kwargs)

    def __str__(self):
        return f"{self.email}"
