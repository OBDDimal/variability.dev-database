from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from django.forms import ModelForm

# all supported file types
FORMAT_CHOICES = (
    ('Dimacs', 'DIMACS'),
)

# tags used to filter files


class Tag(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


# files uploaded to the server
class File(models.Model):
    # name of the file
    description = models.CharField(max_length=5000)
    # file format
    format = models.CharField(
        max_length=6, choices=FORMAT_CHOICES, default='Dimacs')
    # creator of the file
    author = models.CharField(max_length=50)
    # source of the file
    source = models.CharField(max_length=200)
    # license of the file
    license = models.CharField(max_length=20)
    # tags used to identify and describe the file
    tags = models.ManyToManyField(Tag, blank=True)
    # content
    file = models.FileField(upload_to='files/')
    # if the file is publicly viewable or restricted
    public = models.BooleanField()
    # sha256 hash of the files content
    hash = models.CharField(max_length=64)

    def __str__(self):
        return self.file.name

    def displayTags(self):
        return ', '.join(map(str, self.tags.all()))
        
    def get_file_name(self):
        return self.file.name.split('/')[1] if '/' in self.file.name else self.file.name

    def get_sortable_fields():
        return ['format', 'description', 'author', 'source', 'license']

    def get_filter_categories():
        return ['format','description','author', 'source', 'license', 'hash']



class FileUploadForm(ModelForm):
    class Meta:
        model = File
        fields = ['description', 'format', 'author',
                  'source', 'license', 'file', 'tags', 'public']
