from django.db import models
from core.fileupload.models.file import File
from core.user.models import User

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
    """
    Is a not finished Analysis
    """
    file_to_analyse = models.ForeignKey(File, on_delete=models.CASCADE)
    # maximal available server resources in the form 'RAM-CPU'
    resources = models.CharField(max_length=20, choices=RESOURCE_OPTIONS, default='4-1')
    owner = models.ForeignKey(User, on_delete=models.RESTRICT)
    library = models.CharField(max_length=25, choices=LIBRARIES)
    working = models.BooleanField(default=False)  # indicates if there should be a process running this analysis


    class Meta:
        verbose_name = 'dockerProcess'
        verbose_name_plural = 'dockerProcesses'

    def __str__(self):
        # do not change that
        return f"{self.id}"


class Analysis(models.Model):
    """
    finished analysis of a File with analysis report and order
    """
    report = models.TextField(blank=True)
    order = models.TextField(blank=True)
    # TODO: delete process field
    process = models.OneToOneField(DockerProcess, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'analysis'
        verbose_name_plural = 'analyses'

    def __str__(self):
        # do not change that
        return f"{self.id}"
