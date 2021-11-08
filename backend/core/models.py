from django.db import models


# Create your models here.
class FileUpload(models.Model):
    LICENCES = [
        ('CC BY', 'CC BY - Mention'),
        ('CC BY-NC', ' CC BY-NC - Mention - Non-commercial')
    ]

    description = models.TextField()
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    licence = models.CharField(choices=LICENCES, max_length=255)
    # Relation to uploader -> User management needed (Many to Many field)
