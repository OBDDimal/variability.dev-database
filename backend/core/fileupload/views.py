from collections import OrderedDict
from django.template.loader import render_to_string
from core.fileupload.models.tag import Tag
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from core.fileupload.models.file import File
from core.fileupload.serializers import FilesSerializer, TagsSerializer


class FileUploadViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """
        Replace email address of file owner and label creator with True or False,
        indicating if the user which has sent the request is the owner/creator.
        """
        queryset = File.objects.all()
        files = FilesSerializer(queryset, many=True).data
        changed_files = []
        for file in files:
            changed_file = OrderedDict()
            for tuple in file.items():
                if tuple[0] == 'owner':
                    changed_file[tuple[0]] = True if tuple[1] == request.user else False
                elif tuple[0] == 'tags':
                    tags = []
                    for tag in list(tuple[1]):
                        new_tag = OrderedDict()
                        for tagTuple in tag.items():
                            if tagTuple[0] == 'creator':
                                new_tag[tagTuple[0]] = True if tagTuple[1] == request.user else False
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

        self.request.user.email_user('DDueruem File Upload', render_to_string('email/user_upload_email.html', {
            'user': str(self.request.user.email),
            'protocol': 'http',
            'file_domain': str(serializer.data.get('file')),
            'file_name': str(serializer.data.get('file')).split('/')[-1],
            # TODO: For Issue #28 'delete_domain': 'localhost:8000/'
        }))


class TagsViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
