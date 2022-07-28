import json

from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from core.fileupload.models import Family, Tag, License, File
from core.analysis.models import DockerProcess, Analysis
from core.analysis.serializers import AnalysesSerializer
from rest_framework import serializers
from django.http import QueryDict
from transpiler.g6_transpiler import xml_to_g6


class FamiliesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Feature Model Family attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Family
        fields = ['id', 'owner', 'label', 'description', 'date_created']


class LicensesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which License attributes should be converted to JSON
    """

    class Meta:
        model = License
        fields = ['id', 'label']


class TagsSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Tag attributes should be converted to JSON
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
    license = LicensesSerializer()
    analysis = serializers.SerializerMethodField(method_name='get_analysis_state')
    new_version_of = 'self'

    def get_analysis_state(self, file):
        """
        Return Analysis belonging to this file or None
        """
        if not file:
            return None
        if not file.is_confirmed:
            return None
        dp = None
        try:
            dp = DockerProcess.objects.filter(file_to_analyse=file).get()
        except ObjectDoesNotExist:
            return None
        analysis = None
        try:
            analysis = Analysis.objects.filter(process=dp).get()
        except ObjectDoesNotExist:
            return None
        if dp is None or analysis is None:
            return None
        else:
            return AnalysesSerializer(analysis).data

    class Meta:
        model = File
        fields = ['id', 'label', 'description', 'local_file', 'family', 'license', 'tags', 'owner', 'uploaded_at',
                  'new_version_of', 'transpiled_file', 'analysis']
        read_only_fields = ['mirrored', 'is_confirmed']

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
            if key not in ['tags', 'family', 'license']:
                internal_rep.update({key: data[key]})

        tags = list(map(lambda tag: Tag.objects.get(id=tag), data.getlist('tags')))

        if 'family' in data:
            family = Family.objects.get(id=data['family'])
        else:
            # Hope that new_version_of is set!
            if 'new_version_of' not in data:
                raise TypeError('family or new_version_of must be set!')
            new_version_of = File.objects.get(id=data['new_version_of'])
            family = new_version_of.family

        license = License.objects.get(id=data['license'])

        internal_rep['tags'] = tags
        internal_rep['family'] = family
        internal_rep['license'] = license

        return internal_rep.dict()
