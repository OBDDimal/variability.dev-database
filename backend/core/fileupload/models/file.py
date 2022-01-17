from django.db import models
from .tag import Tag
from core.user.models import User
from django.core.files.base import ContentFile


class FileManager(models.Manager):
    use_in_migrations = True

    def save_file(self, local_file, **kwargs):
        """
        Saves a file with the given attributes to the database
        """
        if kwargs.get('label', None) is None:
            raise TypeError('File name is not set')
        if local_file is None:
            raise TypeError('File path is not set')
        tags = kwargs.pop('tags')
        if tags is None:
            raise TypeError('Tags is not set')
        # get file from id
        if kwargs.get('new_version_of', None) is not None:
            kwargs.update({'new_version_of': File.objects.get(id=kwargs['new_version_of'])})
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
    LICENSES = [
        ('CC BY - Mention', 'CC BY - Mention'),
        ('CC BY-NC - Mention - Non-commercial', 'CC BY-NC - Mention - Non-commercial')
    ]

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    label = models.CharField(blank=False, max_length=255)
    description = models.TextField(blank=True)
    local_file = models.FileField(upload_to=relative_upload_dir)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')
    tags = models.ManyToManyField(Tag)
    new_version_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.RESTRICT)
    transpiled_file = models.FileField(null=True, blank=True, upload_to=relative_upload_dir)

    def __str__(self):
        return f"{self.id}"
