from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group
from django.core.mail import send_mail


class UserManager(BaseUserManager):
    use_in_migrations = True

    def save_user(self, email, password, **kwargs):
        """
        Saves an user with the given attributes to the database
        """
        if email is None:
            raise TypeError('Email for user is not set')
        if password is None:
            raise TypeError('Password for user is not set')

        email = self.normalize_email(email)
        user = self.model(email=email, **kwargs)

        # Call this method for password hashing
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **kwargs):
        """
        Creates an user with the given attributes
        """
        kwargs.setdefault('is_superuser', False)
        kwargs.setdefault('is_staff', False)
        return self.save_user(email, password, **kwargs)

    def create_staffuser(self, email, password, **kwargs):
        """
        Creates an user with activated staff flag and the given attributes
        """
        kwargs.setdefault('is_superuser', False)
        kwargs.setdefault('is_staff', True)
        return self.save_user(email, password, **kwargs)

    def create_superuser(self, email, password, **kwargs):
        """
        Creates a superuser with the given attributes
        """
        kwargs.setdefault('is_superuser', True)
        kwargs.setdefault('is_staff', True)

        # I dont know if this is necessary but people keep on doing this in tutorials ...
        if kwargs.get('is_superuser') is not True:
            raise ValueError('is_superuser should be True')
        return self.save_user(email, password, **kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(db_index=True, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField('date joined', auto_now_add=True, editable=False)
    institute = models.CharField(db_index=True, max_length=255, unique=False)
    bio = models.TextField(max_length=500, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this user
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def __str__(self):
        return f"{self.email}"
