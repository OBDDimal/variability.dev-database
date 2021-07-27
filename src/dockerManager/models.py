from django.db import models
from django.db.models.deletion import CASCADE
from django.forms import ModelForm

# different resource settings available
RESOURCE_OPTIONS = {
    ('4-1', '4 GB RAM, 1 CPU core'),
    ('32-1', '32 GB RAM, 1 CPU core'),
    ('32-16', '32 GB RAM, 16 CPU cores'),
}

# Create your models here.
class DockerProcess(models.Model):
    file = models.ForeignKey('FileManager.File', on_delete=CASCADE)
    resources = models.CharField(
        max_length=20, choices=RESOURCE_OPTIONS, default=('4-1'))
    feedback_email = models.CharField(max_length=50)

class ProcessCreationForm(ModelForm):
    class Meta:
        model = DockerProcess
        fields = ['file', 'resources', 'feedback_email']
