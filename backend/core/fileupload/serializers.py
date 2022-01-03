import json

from core.fileupload.models.file import File, Tag
from rest_framework import serializers
from django.http import QueryDict


class TagsSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    creator = serializers.ReadOnlyField(source='creator.email')

    class Meta:
        model = Tag
        fields = ['id', 'label', 'creator', 'description', 'date_created', 'is_public']


class FilesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.email')
    # For further relations on serializers:
    # https://www.django-rest-framework.org/api-guide/relations
    tags = TagsSerializer(many=True)
    new_version_of = 'self'

    class Meta:
        model = File
        fields = ['id', 'label', 'description', 'local_file', 'license', 'tags', 'owner', 'uploaded_at', 'new_version_of']

    def create(self, validated_data):
        return File.objects.create(**validated_data)

    def to_internal_value(self, data):
        # json_data = {'tags': json.loads(data['tags']), 'local_file': data.pop('local_file')}
        return super().to_internal_value(data)
