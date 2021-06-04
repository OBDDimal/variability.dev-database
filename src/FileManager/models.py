from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from django.forms import ModelForm

#all supported file types
FORMAT_CHOICES = (
    ('Dimacs','DIMACS'),
)

#tags used to filter files
class Tag(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


#files uploaded to the server
class File(models.Model):
    #name of the file
    name = models.CharField(max_length=50)
    #file format
    format = models.CharField(max_length=6, choices=FORMAT_CHOICES, default = 'Dimacs')
    #creator of the file
    author = models.CharField(max_length=50)
    #source of the file
    source = models.CharField(max_length=200)
    #user that uploaded the file, if one exists
    uploader = models.ForeignKey(User, models.CASCADE, blank=True, null=True)
    #license of the file
    license = models.CharField(max_length=20)
    #tags used to identify and describe the file
    tags = models.ManyToManyField(Tag, blank=True)
    #content
    file = models.FileField(upload_to='files/')

    def __str__(self):
        return self.name + '.' + self.format

    def displayTags(self):
        return ', '.join(map(str,self.tags.all()))


class FileUploadForm(ModelForm):
    class Meta:
        model = File
        fields = ['name','format','author','source','license','file','tags']
