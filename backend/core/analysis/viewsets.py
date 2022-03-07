from rest_framework import viewsets, permissions
from .models import Analysis, DockerProcess
from core.fileupload.models.file import File
from .serializers import AnalysesSerializer, DockerProcessesSerializer


class AnalysesViewSet(viewsets.ModelViewSet):
    queryset = Analysis.objects.all()
    serializer_class = AnalysesSerializer
    permission_classes = [permissions.AllowAny]


class DockerProcessesViewSet(viewsets.ModelViewSet):
    queryset = DockerProcess.objects.all()
    serializer_class = DockerProcessesSerializer
    permission_classes = [permissions.AllowAny]
