from rest_framework import serializers

from core.fileupload.models import File


class FilesSerializer(serializers.HyperlinkedModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = File
        fields = ['description', 'file', 'license', 'owner', 'uploaded_at']
