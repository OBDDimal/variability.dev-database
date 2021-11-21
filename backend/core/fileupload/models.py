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

    description = models.TextField()
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
