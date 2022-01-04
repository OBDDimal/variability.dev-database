from django.db import models
from core.user.models import User


class Tag(models.Model):
    """
    Data Model for a file tag.
    A file can be related to many tags and a single tag can be related to many files.
    """

    creator = models.ForeignKey(User, on_delete=models.RESTRICT)  # TODO: Remove on_delete=CASCADE
    label = models.CharField(max_length=30, unique=False, blank=False)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}:{self.label}"
