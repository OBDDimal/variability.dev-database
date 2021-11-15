from rest_framework import viewsets, permissions
from core.fileupload.models import FileUpload
from core.fileupload.serializers import FilesSerializer


class FileUploadSetView(viewsets.ModelViewSet):
    queryset = FileUpload.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]
