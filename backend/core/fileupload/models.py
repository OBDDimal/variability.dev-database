from django.db import models


# Create your models here.
class FileUpload(models.Model):
    LICENSES = [
        ('CC BY - Mention', 'CC BY - Mention'),
        ('CC BY-NC - Mention - Non-commercial', 'CC BY-NC - Mention - Non-commercial')
    ]

    description = models.TextField()
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    license = models.CharField(choices=LICENSES, max_length=255, default='CC BY - Mention')
    # Relation to uploader -> User management needed (One to One field)
