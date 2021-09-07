from django.db import models
from django.contrib.auth.models import User
from django.db.models.deletion import CASCADE
from django.forms import ModelForm, FileField

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
    name = models.CharField(max_length=500)
    # content of the file
    content = models.CharField(max_length=100000) 
    # description of the file contents
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
    # if the file is publicly viewable or restricted
    public = models.BooleanField()
    # sha256 hash of the files content
    hash = models.CharField(max_length=64)

    def __str__(self):
        return self.name

    def displayTags(self):
        '''
        Used to get a displayable string out of all available tags
        '''
        return ', '.join(map(str, self.tags.all()))

    def get_sortable_fields():
        '''
        A list of all fields that can be used to sort the results
        '''
        return ['name', 'format', 'description', 'author', 'source', 'hash']

    def get_filter_categories():
        ''' 
        A list of all fields that can be used to filter the results
        '''
        return ['name', 'format','description','author', 'source', 'license', 'hash']



class FileUploadForm(ModelForm):
    file = FileField()
    class Meta:
        model = File
        fields = ['description', 'format', 'author',
                  'source', 'license', 'tags', 'public']

class Token(models.Model):
    '''
    Class that represents authentication tokens
    '''
    value = models.CharField(max_length=64)
    persistent = models.BooleanField()
    last_request = models.TimeField()
    requests_remaining = models.IntegerField()

    def is_valid(self):
        return self.persistent or self.requests_remaining > 0
