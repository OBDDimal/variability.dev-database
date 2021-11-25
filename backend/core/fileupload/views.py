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
            'file_domain': 'localhost:8000/',
            'file_name': str(serializer.data.get('file')),
            'delete_domain': 'localhost:8000/'
        }))


def download(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/vnd.ms-excel")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
            return response
    raise Http404
