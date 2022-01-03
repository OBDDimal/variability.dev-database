from django.db import models
from django.utils import timezone

from .tag import Tag
from core.user.models import User
from django.core.files.storage import default_storage
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings


class FileManager(models.Manager):
    use_in_migrations = True

    def save_file(self, local_file, **kwargs):
        """
        Saves a file with the given attributes to the database
        """
        if local_file is None:
            raise TypeError('File path is not set')
        print(f"kwargs={kwargs}")
        tags = kwargs.pop('tags')
        file = self.model(**kwargs)

        print(f"local={local_file}")
        # fname = default_storage.save('TEST', local_file)
        # file.save(using=self._db)
        file.save()
        # for some reason tags is an array again
        for tag in list(tags):
            file.tags.set(tag)
        # for some reason uploaded file is an array again
        temp = local_file[0]
        # print(f"temp={temp[0]} {type(temp)}")
        # print(f"file={file}\n{type(file)}")
        file.save()
        print("-----------------")
        print(f"name={temp.name}\nfile={temp.file}\n")
        # save to disk
        relative_file_path = f"{File.relative_upload_dir}/{temp.name}"
        # better if files can be large
        # https://stackoverflow.com/questions/3702465/how-to-copy-inmemoryuploadedfile-object-to-disk/30195605
        # with default_storage.open(relative_file_path, 'wb+') as destination:
        #    for chunk in temp.chunks():
        #        destination.write(chunk)
        f = ContentFile(temp.file.read(), temp.name)
        # file.local_file = temp.file
        file.local_file = f
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
    label = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    local_file = models.FileField(upload_to=relative_upload_dir)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')
    tags = models.ManyToManyField(Tag)
    new_version_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.RESTRICT)

    def __str__(self):
        return f"{self.id}"
