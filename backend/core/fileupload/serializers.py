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
        print("hello")
        print(validated_data)
        data_without_tags = {}
        for k in validated_data:
            if k == 'tags':
                data_without_tags.update({k: []})
            else:
                data_without_tags.update({k: validated_data[k]})

        print(f"data={data_without_tags['local_file']}")
        file = File.objects.create(**validated_data)
        print(f"file={file}")
        # return File.objects.create(**validated_data)
        return file

    def to_internal_value(self, data):
        print(f"...Received data from user\n {data}")
        # print(f"{type(data['tags'])} {json.dumps(data['tags'], indent=2)}")
        internal_rep = QueryDict('', mutable=True)
        for key in data:
            if key != 'tags':
                internal_rep.update({key: data[key]})
            else:
                internal_rep.update({key: [TagsSerializer(Tag.objects.get(id=1)).data]})

        # print(f"{type(data['local_file'])} {data['local_file']}")
        # print(f"{type(data['tags'])} {data['tags']}")
        # print(f"rep= {internal_rep}")
        # qd = QueryDict('', mutable=True)
        # print(TagsSerializer(Tag.objects.get(id=1)).data)
        # qd.update(internal_rep)
        # print(f"AS QUERY= {qd}")

        tags_as_string = data['tags'].replace('\'', '"')
        # print(f"Parsed data from user\n {data}")
        tags_as_json = json.loads(tags_as_string)
        # print(f"{type(tags_as_json)} {tags_as_json}")
        # data.pop('tags')
        # data.update({'data': json_data})
        new_data = {}
        tags_from_db = []
        for tag in tags_as_json:
            tags_from_db.append(Tag.objects.get(id=tag['id']))
        print(f"tags from db= {tags_from_db}")
        internal_rep['tags'] = tags_from_db
        # print(f"new_data={new_data['tags']}")
        print(f"internal={internal_rep}")
        return internal_rep
