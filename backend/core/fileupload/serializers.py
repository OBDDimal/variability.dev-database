import json

from core.fileupload.models.file import File, Tag
from rest_framework import serializers


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

    class Meta:
        model = File
        fields = ['id', 'description', 'local_file', 'license', 'tags', 'owner', 'uploaded_at']

    def create(self, validated_data):
        return File.objects.create(**validated_data)

    def to_internal_value(self, data):
        json_data = json.loads(data['tags'])
        data.pop('tags')
        data.update({'data': json_data})
        print(data)
        return super().to_internal_value(data)
