import json
from django.core.files.base import ContentFile
from core.fileupload.models.family import Family
from core.fileupload.models.file import File, Tag
from rest_framework import serializers
from django.http import QueryDict
import core.fileupload.githubmirror.github_manager as mirror
from transpiler.g6_transpiler import xml_to_g6


class FamiliesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Feature Model Family attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Family
        fields = ['id', 'owner', 'label', 'description']


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
    family = FamiliesSerializer()
    new_version_of = 'self'

    class Meta:
        model = File
        fields = ['id', 'label', 'description', 'local_file', 'family', 'license', 'tags', 'owner', 'uploaded_at',
                  'new_version_of', 'transpiled_file']

    def create(self, validated_data):
        """
        Actually tries to create and save the internal representation into the database.
        """
        file = File.objects.create(**validated_data)
        data = validated_data['local_file']
        file_content = ''
        for line in data:
            file_content = file_content + line.decode()

        transpiled = json.dumps(xml_to_g6(file_content, is_file_path=False), indent=2)
        file.transpiled_file = ContentFile(bytes(transpiled, encoding='utf8'), f"{file.label}_as_g6.json")
        file.save()
        #mirror.mirror_to_github(file)
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
        if internal_rep.get('family', None) is None:
            new_version_of = internal_rep.get('new_version_of')
            if new_version_of is not None:
                internal_rep.update({'family': str(File.objects.get(id=new_version_of).family)})
        return internal_rep.dict()
