from rest_framework import views, viewsets, permissions
from core.models import FileUpload
from core.serializers import FilesSerializer


class FileUploadSetView(viewsets.ModelViewSet):
    queryset = FileUpload.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.IsAuthenticated]
