from django.db import models
from core.user.models import User
from django.core.files.base import ContentFile
from django.template.defaultfilters import slugify  # new


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
    slug = models.SlugField(null=True)

    class Meta:
        verbose_name = "family"
        verbose_name_plural = "families"
        indexes = [
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        # do not change that
        return f"{self.id}:{self.label}"

    def save(self, *args, **kwargs):  # new
        if not self.slug:
            self.slug = slugify(self.label)
        return super().save(*args, **kwargs)


# -------------------------------------------------- Tag Model --------------------------------------------------
class Tag(models.Model):
    """
    Data Model for a file tag.
    A file can be related to many tags and a single tag can be related to many files.
    """

    owner = models.ForeignKey(
        User, on_delete=models.RESTRICT
    )  # TODO: Remove on_delete=CASCADE
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
        if kwargs.get("label", None) is None:
            raise TypeError("License label is not set")
        lic = self.model(**kwargs)
        lic.save()
        return lic


class License(models.Model):
    """
    Data Model for a license in the backend
    """

    objects = LicenseManager()
    _default_license = "CC BY - Mention"

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
        if kwargs.get("owner", None) is None:
            raise TypeError("File owner is not set")
        if kwargs.get("label", None) is None:
            raise TypeError("File name is not set")
        if local_file is None:
            raise TypeError("File path is not set")
        tags = kwargs.pop("tags")
        if tags is None:
            raise TypeError("Tags is not set")
        family = kwargs.get("family", None)
        # get file from id
        if kwargs.get("version", None) is None:
            raise TypeError("Version is not set")
        # get license from id
        if kwargs.get("license", None) is None:
            raise TypeError("License not set!")
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
        return self.save_file(kwargs.pop("local_file"), **kwargs)


class File(models.Model):
    """
    Data Model for a file in the backend
    """

    objects = FileManager()

    relative_upload_dir = "files/"

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    label = models.CharField(blank=False, max_length=255)
    description = models.TextField(blank=True)
    local_file = models.FileField(upload_to=relative_upload_dir)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.ForeignKey(License, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag)
    version = models.CharField(blank=False, null=False, max_length=16)
    transpiled_file = models.FileField(
        null=True, blank=True, upload_to=relative_upload_dir
    )
    mirrored = models.BooleanField(
        default=False
    )  # indicates if the file was already mirrored to GitHub
    is_confirmed = models.BooleanField(
        default=False
    )  # indicates if the user confirmed the upload
    slug = models.SlugField(null=True)
    confirmation_token = models.CharField(default="", max_length=255)

    class Meta:
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['family']),
            models.Index(fields=['is_confirmed']),
        ]

    def __str__(self):
        # do not change that
        return f"{self.id}"

    def save(self, *args, **kwargs):  # new
        if not self.slug:
            self.slug = slugify(self.label)
        return super().save(*args, **kwargs)


class Analysis(models.Model):
    admin_only = models.BooleanField(default=False)
    disabled = models.BooleanField(default=False)
    query = models.TextField()

    depends_on = models.ManyToManyField("self", symmetrical=False)


class AnalysisResult(models.Model):
    triggered = models.BooleanField(default=False)
    error = models.BooleanField(default=False)
    result = models.JSONField(null=True)

    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
