from django.db import models
from core.user.models import User
from django.core.files.base import ContentFile


# -------------------------------------------------- Family Model --------------------------------------------------
class Family(models.Model):
    """
    Data Model for a Feature Model Family in the backend.
    A Feature Model Family consists of 1 to n Feature Models.
    """

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    label = models.CharField(blank=False, max_length=255)
    description = models.TextField(blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'family'
        verbose_name_plural = 'families'

    def __str__(self):
        # do not change that
        return f"{self.id}:{self.label}"


# -------------------------------------------------- Tag Model --------------------------------------------------
class Tag(models.Model):
    """
    Data Model for a file tag.
    A file can be related to many tags and a single tag can be related to many files.
    """

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)  # TODO: Remove on_delete=CASCADE
    label = models.CharField(max_length=30, unique=False, blank=False)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # do not change that
        return f"{self.id}:{self.label}"


# -------------------------------------------------- License Model --------------------------------------------------
class LicenseManager(models.Manager):
    use_in_migrations = True

    def create(self, **kwargs):
        """
        Creates a license. Only admins/staff should be allowed to that.
        Since checking staff_required here is difficult, the serializer
        checks the permissions.
        """
        if kwargs.get('label', None) is None:
            raise TypeError('License label is not set')
        lic = self.model(**kwargs)
        lic.save()
        return lic


class License(models.Model):
    """
    Data Model for a license in the backend
    """
    objects = LicenseManager()
    _default_license = 'CC BY - Mention'

    label = models.TextField(blank=False, default=_default_license)

    def __str__(self):
        # do not change that
        return f"{self.id}"


# -------------------------------------------------- File Model --------------------------------------------------
class FileManager(models.Manager):
    use_in_migrations = True

    def save_file(self, local_file, **kwargs):
        """
        Saves a file with the given attributes to the database
        """
        if kwargs.get('owner', None) is None:
            raise TypeError('File owner is not set')
        if kwargs.get('label', None) is None:
            raise TypeError('File name is not set')
        if local_file is None:
            raise TypeError('File path is not set')
        tags = kwargs.pop('tags')
        if tags is None:
            raise TypeError('Tags is not set')
        family = kwargs.get('family', None)
        if family is None:
            raise TypeError('Feature Model Family is not set')
        else:
            family_id = family.split(':')[0]
            kwargs.update({'family': Family.objects.get(id=int(family_id))})
        # get file from id
        if kwargs.get('new_version_of', None) is not None:
            kwargs.update({'new_version_of': File.objects.get(id=kwargs['new_version_of'])})
        # get license from id
        if kwargs.get('license', None) is None:
            raise TypeError('License not set!')
        else:
            kwargs.update({'license': License.objects.get(id=kwargs['license'])})
        file = self.model(**kwargs)
        file.save()
        file.tags.set(tags)
        file.save()
        temp = local_file
        # save to disk
        relative_file_path = f"{File.relative_upload_dir}/{temp.name}"
        # better if files can be large
        # https://stackoverflow.com/questions/3702465/how-to-copy-inmemoryuploadedfile-object-to-disk/30195605
        # with default_storage.open(relative_file_path, 'wb+') as destination:
        #    for chunk in temp.chunks():
        #        destination.write(chunk)
        file.local_file = ContentFile(temp.file.read(), temp.name)
        file.save()
        return file

    def create(self, **kwargs):
        """
        Creates a file
        """
        return self.save_file(kwargs.pop('local_file'), **kwargs)


class File(models.Model):
    """
    Data Model for a file in the backend
    """
    objects = FileManager()

    relative_upload_dir = 'files/'

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    label = models.CharField(blank=False, max_length=255)
    description = models.TextField(blank=True)
    local_file = models.FileField(upload_to=relative_upload_dir)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.ForeignKey(License, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag)
    new_version_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.RESTRICT)
    transpiled_file = models.FileField(null=True, blank=True, upload_to=relative_upload_dir)
    mirrored = models.BooleanField(default=False)  # indicates if the file was already mirrored to GitHub
    is_confirmed = models.BooleanField(default=False)  # indicates if the user confirmed the upload

    def __str__(self):
        # do not change that
        return f"{self.id}"


class BackgroundTask(models.Model):
    """
    This model represents a task that is to be executed in the background.

    It has the following properties:
    `locked`: Whether the task is executed right now.
    """
    locked = models.BooleanField(default=False)

    def run(self):
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

    def run(self):
        if self.attempts >= self.runs:
            # We already ran the required number of times
            self.cleanup()
            self.delete()
        if datetime.now() >= self.last_run_at + timedelta(minutes=self.repeat):
            # We should update the number of runs and the timestamp of the last run and then retry
            self.runs += 1
            self.last_run_at = datetime.now()
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
            send_mail(self.subject, self.message, self.from_email, self.recipients, html_message=self.html_message)
            return True
        except:
            return False

