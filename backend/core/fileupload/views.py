import os

from django.conf import settings
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from rest_framework import viewsets, permissions

from core.fileupload.models import File
from core.fileupload.serializers import FilesSerializer


class FileUploadViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

        self.request.user.email_user('DDueruem File Upload', render_to_string('email/user_upload_email.html', {
            'user': str(self.request.user.email),
            'protocol': 'http',
            'file_domain': str(serializer.data.get('file')),
            'file_name': str(serializer.data.get('file')).split('/')[-1],
            # TODO: For Issue #28 'delete_domain': 'localhost:8000/'
        }))
