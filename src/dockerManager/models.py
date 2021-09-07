from django.db import models
from django.db.models.deletion import CASCADE
from django.forms import ModelForm

# different resource settings available
RESOURCE_OPTIONS = {
    ('4-1', '4 GB RAM, 1 CPU core'),
    ('32-1', '32 GB RAM, 1 CPU core'),
    ('32-16', '32 GB RAM, 16 CPU cores'),
}

LIBRARIES = (
    ('buddy', 'BuDDy'),
    ('cudd', 'CUDD')
)

class DockerProcess(models.Model):
    # the file object thats analzyed
    file = models.ForeignKey('FileManager.File', on_delete=CASCADE)
    # maximal available server resources in the form 'RAM-CPU'
    resources = models.CharField(
        max_length=20, choices=RESOURCE_OPTIONS, default=('4-1'))
    feedback_email = models.CharField(max_length=50)
    # library used to anazlyze the file
    library = models.CharField(max_length=10, choices=LIBRARIES)


class Analysis(models.Model):
    # the report file
    report = models.CharField(max_length=200000)
    # ordering file
    order = models.CharField(max_length=200000)
    process = models.OneToOneField(DockerProcess, on_delete=models.CASCADE)


class ProcessCreationForm(ModelForm):
    class Meta:
        model = DockerProcess
        fields = ['file', 'resources', 'feedback_email', 'library']
