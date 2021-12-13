from rest_framework import serializers

from core.fileupload.models.file import File, Tag

class TagsSerializer(serializers.HyperlinkedModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    # creator = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Tag
        fields = ['label']

class FilesSerializer(serializers.HyperlinkedModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.username')
    tags = TagsSerializer(many=True)

    class Meta:
        model = File
        fields = ['id', 'description', 'local_file', 'license', 'tags', 'owner', 'uploaded_at']
