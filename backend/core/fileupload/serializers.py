import json

from core.fileupload.models.file import File, Tag
from rest_framework import serializers
from django.http import QueryDict


class TagsSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Tag
        fields = ['id', 'label', 'owner', 'description', 'date_created', 'is_public']


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
        fields = ['id', 'label', 'description', 'local_file', 'license', 'tags', 'owner', 'uploaded_at',
                  'new_version_of']

    def create(self, validated_data):
        """
        Actually tries to create and save the internal representation into the database.
        """
        file = File.objects.create(**validated_data)
        return file

    def update(self, instance, validated_data):
        """
        Updates the label, description, tags and new_version_of an already existing file.
        """
        instance.label = validated_data.get('label', instance.label)
        instance.description = validated_data.get('label', instance.description)
        instance.tags = validated_data.get('tags', instance.tags)
        instance.new_version_of = validated_data.get('tags', instance.new_version_of)
        instance.save()
        return instance

    def to_internal_value(self, data):
        """
        Turns the received data from frontend into the internally used representation.
        After this method, create will be called.
        """
        internal_rep = QueryDict('', mutable=True)
        for key in data:
            if key != 'tags':
                internal_rep.update({key: data[key]})

        tags_as_string = data['tags'].replace('\'', '"')
        tags_as_json = json.loads(tags_as_string)
        tags_from_db = []
        for tag in tags_as_json:
            tags_from_db.append(Tag.objects.get(id=tag['id']))
        internal_rep['tags'] = tags_from_db

        return internal_rep.dict()
