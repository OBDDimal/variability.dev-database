from rest_framework import serializers

from core.models import FileUpload


class FilesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['description', 'file', 'licence', 'uploaded_at']
