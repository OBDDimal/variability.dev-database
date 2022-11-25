from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group
from django.core.mail import send_mail
from django.db import models
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.timezone import now

from core.auth.tokens import encode_user_to_token
from ddueruemweb.settings import env

from datetime import datetime, timedelta

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
        kwargs.update({
            'is_superuser': False,
            'is_staff': False,
            'is_active': False
        })
        return self.save_user(email, password, **kwargs)

    def create_staffuser(self, email, password, **kwargs):
        """
        Creates an user with activated staff flag and the given attributes
        """
        kwargs.update({
            'is_superuser': False,
            'is_staff': True,
            'is_active': False
        })
        return self.save_user(email, password, **kwargs)

    def create_superuser(self, email, password, **kwargs):
        """
        Creates a superuser with the given attributes
        """
        kwargs.update({
            'is_superuser': True,
            'is_staff': True,
            'is_active': True
        })
        return self.save_user(email, password, **kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(db_index=True, unique=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField('date joined', auto_now_add=True, editable=False)
    institute = models.CharField(max_length=255, unique=False, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def send_link_to_files(self, confirmation_token):
        """
        Send predefined email with link to File after successful upload.
        """
        user = self
        html_message = render_to_string('email/user_upload_email.html', {
            'user': str(user.email),
            'confirm_link': f"{env('FRONTEND_URL')}/files/uploaded/unconfirmed/confirm/{confirmation_token}",
            'delete_link': f"{env('FRONTEND_URL')}/files/uploaded/unconfirmed/delete/{confirmation_token}",
        })
        plain_message = strip_tags(html_message)

        user._email_user('DDueruem File Upload', plain_message, html_message=html_message)

    def send_activation_link(self):
        """
        Send predefined activation email this user.
        It is a method to make resending in e.g. admin view easier
        """
        user = self
        extended_user = {
            'id': str(user.id),
            'email': str(user.email),
            'timestamp': str(now()),
            'purpose': 'user_activation'
        }
        link = f"{env('FRONTEND_URL')}/register/{encode_user_to_token(extended_user)}"
        html_message = render_to_string('email/user_activation_email.html', {
            'user': str(user.email),
            'link': link
        })
        plain_message = strip_tags(html_message)
        user._email_user("DDueruem Account Activation", plain_message, html_message=html_message)

    def _email_user(self, subject, message, from_email="noreply@uni-ulm.de", **kwargs):
        """
        Sends an email to this user asynchronously
        """
        if 'html_message' in kwargs:
            html_message = kwargs['html_message']
        else:
            html_message = message
        email_sender = EmailSendTask(subject=subject, message=message, from_email=from_email, recipient=self.email, html_message=html_message, attempts=5, repeat=60)
        email_sender.save()

    def __str__(self):
        return f"{self.email}"


class BackgroundTask(models.Model):
    """
    This model represents a task that is to be executed in the background.

    It has the following properties:
    `locked`: Whether the task is executed right now.
    """
    locked = models.BooleanField(default=False)

    def run(self):
        # This code technically has a race condition, but I'm unsure how this
        # race condition can be avoided using the tools offered by django.
        if self.locked:
            return
        self.locked = True
        self.save()
        try:
            self.do()
        finally:
            if self.pk is not None:
                # Only save the object if it hasn't been deleted
                self.locked = False
                self.save()

    def do(self):
        ...

    class Meta:
        abstract = True


class RetryTask(BackgroundTask):
    """
    This model represents a task that is to be retried a certain number of times.

    It has the following properties:
    `runs`: The number of times this task has been executed already.
    `attempts`: The number of times this task should be executed.
    `last_run_at`: The last time this task was executed.
    `repeat`: The time to wait before this task should be retried in minutes.
    """
    runs = models.PositiveIntegerField(default=0)
    attempts = models.PositiveIntegerField(null=False)
    last_run_at = models.DateTimeField(null=True)
    repeat = models.PositiveIntegerField(null=False)

    def do(self):
        if self.attempts >= self.runs:
            # We already ran the required number of times
            self.cleanup()
            self.delete()
        if self.last_run_at is None or now() >= self.last_run_at + timedelta(minutes=self.repeat):
            # We should update the number of runs and the timestamp of the last run and then retry
            self.runs += 1
            self.last_run_at = now()
            self.save()
            if self.retry():
                # Retry was successful
                self.delete()

    def retry(self):
        """
        This method is called every time the task is retried.
        """
        ...

    def cleanup(self):
        """
        This method is called after the number of required retries was reached and before the task is deleted from the database.
        """
        ...

    class Meta:
        abstract = True


class EmailSendTask(RetryTask):
    """
    This model represents a task that will retry sending an email.

    It has the following properties:
    `subject`: The subject line of the email.
    `message`: The plaintext message of the email.
    `from_email`: The sender of the email.
    `recipient`: The receiver of the email.
    `html_message`: The message contents in HTML.
    """
    subject = models.CharField(blank=False, max_length=255)
    message = models.TextField(blank=True)
    from_email = models.CharField(blank=False, max_length=255)
    recipient = models.CharField(blank=False, max_length=255)
    html_message = models.TextField(blank=False)

    def retry(self):
        try:
            send_mail(self.subject, self.message, self.from_email, [self.recipient], html_message=self.html_message)
            return True
        except:
            return False


def all_subclasses(cls):
    to_visit = set([cls])
    visited = set()
    while len(to_visit):
        n = to_visit.pop()
        if n not in visited:
            to_visit = to_visit.union(n.__subclasses__())
            visited.add(n)
    return visited


def run_tasks():
    non_abstract_task_classes = {task for task in all_subclasses(BackgroundTask) if not task._meta.abstract}
    for task_class in non_abstract_task_classes:
        for task in task_class.objects.all():
            task.run()
