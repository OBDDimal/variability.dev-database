from django.db import models

from core.fileupload.models import File
from django.forms import JSONField

from django.db import models
from django.db.models import JSONField

from core.fileupload.models import Family


from django.db import models

class AnalysisData(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    key = models.CharField(max_length=255, db_index=True)
    value = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.file} - Analysis Data"

    class Meta:
        indexes = [
            models.Index(fields=['key']),
        ]
