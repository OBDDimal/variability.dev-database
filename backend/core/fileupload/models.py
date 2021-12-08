from django.db import models
from core.user.models import User


class File(models.Model):
    """
    Data Model for a file in the backend
    """
    LICENSES = [
        ('CC BY - Mention', 'CC BY - Mention'),
        ('CC BY-NC - Mention - Non-commercial', 'CC BY-NC - Mention - Non-commercial')
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE)  # TODO: Remove on_delete=CASCADE
    description = models.TextField()
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')


class Tag(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)  # TODO: Remove on_delete=CASCADE
    label = models.CharField(max_length=30, unique=False, blank=False)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
