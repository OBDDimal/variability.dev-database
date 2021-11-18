from rest_framework import viewsets, permissions
from core.fileupload.models import File
from core.fileupload.serializers import FilesSerializer


class FileUploadSetView(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
