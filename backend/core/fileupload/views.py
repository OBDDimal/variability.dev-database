from collections import OrderedDict
from pydoc import html, plain
from django.template.loader import render_to_string

from core.fileupload.models.family import Family
from core.fileupload.models.tag import Tag
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from django.utils.html import strip_tags

from core.fileupload.models.file import File
from core.fileupload.serializers import FilesSerializer, TagsSerializer, FamiliesSerializer


class FileUploadViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = File.objects.all()
        files = FilesSerializer(queryset, many=True).data
        changed_files = []
        for file in files:
            changed_file = OrderedDict()
            for tuple in file.items():
                if tuple[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_file[tuple[0]] = tuple[1] == user_mail
                elif tuple[0] == 'tags':
                    tags = []
                    for tag in list(tuple[1]):
                        new_tag = OrderedDict()
                        for tagTuple in tag.items():
                            if tagTuple[0] == 'owner':
                                user_mail = "" if request.user.is_anonymous else request.user.email
                                new_tag[tagTuple[0]] = tagTuple[1] == user_mail
                            else:
                                new_tag[tagTuple[0]] = tagTuple[1]
                        tags.append(new_tag)
                    changed_file[tuple[0]] = tags
                else:
                    changed_file[tuple[0]] = tuple[1]
            changed_files.append(changed_file)
        return Response(changed_files)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        html_message = render_to_string('email/user_upload_email.html', {
            'user': str(self.request.user.email),
            'protocol': 'http',
            'file_domain': str(serializer.data.get('local_file')),
            'file_name': str(serializer.data.get('local_file')).split('/')[-1],
        })
        plain_message = strip_tags(html_message)

        self.request.user._email_user('DDueruem File Upload', plain_message, html_message=html_message)


class FamiliesViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamiliesSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, **kwargs):
        """
        Replace email address of family owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = Family.objects.all()
        families = FamiliesSerializer(queryset, many=True).data
        changed_families = []
        for family in families:
            changed_family = OrderedDict()
            for item in family.items():
                if item[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_family[item[0]] = item[1] == user_mail
                else:
                    changed_family[item[0]] = item[1]
            changed_families.append(changed_family)
        return Response(changed_families)


class TagsViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, **kwargs):
        """
        Replace email address of tag owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = Tag.objects.all()
        tags = TagsSerializer(queryset, many=True).data
        changed_tags = []
        for tag in tags:
            changed_tag = OrderedDict()
            for tuple in tag.items():
                if tuple[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_tag[tuple[0]] = tuple[1] == user_mail
                else:
                    changed_tag[tuple[0]] = tuple[1]
            changed_tags.append(changed_tag)
        return Response(changed_tags)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def delete(self, pk):
        tag = self.get_object(pk)
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
