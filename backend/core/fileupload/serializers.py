import json

from django.core.cache.utils import make_template_fragment_key
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.utils.functional import cached_property

from core.fileupload.models import Family, Tag, License, File, Analysis, AnalysisResult
from rest_framework import serializers
from django.http import QueryDict

from core.user.models import User
from transpiler.g6_transpiler import xml_to_g6
from core.fileupload.utils import generate_random_string
from django.core.cache import cache

class FamiliesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Feature Model Family attributes should be converted to JSON
    """
    def get_owner_email(self, instance):
        cache_key = make_template_fragment_key('owner_email', [instance.pk])
        owner_email = cache.get(cache_key)
        if owner_email is None:
            owner_email = instance.owner.email if instance.owner else ''
            cache.set(cache_key, owner_email, timeout=None)
        return owner_email

    owner = serializers.SerializerMethodField(method_name='get_owner_email')

    class Meta:
        model = Family
        fields = ['id', 'owner', 'label', 'description', 'date_created', 'slug']


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
    def get_owner_email(self, instance):
        cache_key = make_template_fragment_key('owner_email', [instance.pk])
        owner_email = cache.get(cache_key)
        if owner_email is None:
            owner_email = instance.owner.email if instance.owner else ''
            cache.set(cache_key, owner_email, timeout=None)  # Timeout None bedeutet, dass der Cache nicht abläuft
        return owner_email

    owner = serializers.SerializerMethodField(method_name='get_owner_email')

    class Meta:
        model = Tag
        fields = ['id', 'label', 'owner', 'description', 'date_created', 'is_public']


class FilesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which file attributes should be converted to JSON
    """

    def get_owner_email(self, instance):
        cache_key = make_template_fragment_key('owner_email', [instance.pk])
        owner_email = cache.get(cache_key)
        if owner_email is None:
            owner_email = instance.owner.email if instance.owner else ''
            cache.set(cache_key, owner_email, timeout=None)  # Timeout None bedeutet, dass der Cache nicht abläuft
        return owner_email

    owner = serializers.SerializerMethodField(method_name='get_owner_email')
    # For further relations on serializers:
    # https://www.django-rest-framework.org/api-guide/relations
    tags = TagsSerializer(many=True)

    license = LicensesSerializer()

    family = FamiliesSerializer()
    # version = 'self'


    class Meta:
        model = File
        fields = ['id', 'label', 'description', 'local_file', 'family', 'license', 'tags', 'owner', 'uploaded_at',
                  'version', 'transpiled_file', 'slug']
        read_only_fields = ['mirrored', 'is_confirmed']

    def validate(self, data):
        """
        Check that the uploaded file contains valid xml
        """
        try:
            contents = ""
            for line in data['local_file']:
                contents = contents + line.decode()
            xml_to_g6(contents, is_file_path=False)
        except:
            raise serializers.ValidationError("File contains invalid xml")
        return data

    def create(self, validated_data):
        """
        Actually tries to create and save the internal representation into the database.
        """

        file = File.objects.create(**validated_data)
        contents = ""
        for line in validated_data['local_file']:
            contents = contents + line.decode()
        transpiled = json.dumps(xml_to_g6(contents, is_file_path=False), indent=2)
        file.transpiled_file = ContentFile(bytes(transpiled, encoding='utf8'), f"{generate_random_string(20)}.json")
        file.local_file = ContentFile(bytes(contents, encoding='utf8'), f"{generate_random_string(20)}.xml")
        file.save()
        return file

    def update(self, instance, validated_data):
        """
        Updates the label, description, tags and new_version_of an already existing file.
        """
        instance.label = validated_data.get('label', instance.label)
        instance.description = validated_data.get('description', instance.description)
        instance.tags = validated_data.get('tags', instance.tags)
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

        license = License.objects.get(id=data['license'])

        internal_rep['tags'] = tags
        internal_rep['family'] = family
        internal_rep['license'] = license

        return internal_rep.dict()

class AnalysesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Analysis attributes should be converted to JSON
    """

    class Meta:
        model = Analysis
        fields = ['id', 'query', 'admin_only', 'disabled']

class AnalysisResultsSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which AnalysisResult attributes should be converted to JSON
    """
    analysis = AnalysesSerializer()
    file = FilesSerializer()

    class Meta:
        model = AnalysisResult
        fields = ['triggered', 'error', 'result', 'analysis', 'file']
