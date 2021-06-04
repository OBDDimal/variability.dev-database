from django.contrib import admin

from .models import File, Tag

# Register your models here.
admin.site.register(File)
admin.site.register(Tag)