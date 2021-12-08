from django.db import models
from .tag import Tag
from core.user.models import User


class File(models.Model):
    """
    Data Model for a file in the backend
    """

    LICENSES = [
        ('CC BY - Mention', 'CC BY - Mention'),
        ('CC BY-NC - Mention - Non-commercial', 'CC BY-NC - Mention - Non-commercial')
    ]

    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    description = models.TextField(blank=True)
    local_file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')
    tags = models.ManyToManyField(Tag, blank=True)
    new_version_of = models.ForeignKey('self', null=True, blank=True, on_delete=models.RESTRICT)

    def __str__(self):
        return f"{self.id}"

