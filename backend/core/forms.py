from django import forms

from core.models import FileUpload


class FileUploadForm(forms.ModelForm):
    class Meta:
        model = FileUpload
        fields = ('description', 'file', 'licence')
