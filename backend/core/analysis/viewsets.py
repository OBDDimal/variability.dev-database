import logging
import os
from pathlib import Path
from rest_framework import viewsets, permissions
from .models import Analysis, DockerProcess
from .serializers import AnalysesSerializer, DockerProcessesSerializer
from ..user.models import User
from .docker_manager import start_analysis
from multiprocessing import Process

logger = logging.getLogger(__name__)


class AnalysesViewSet(viewsets.ModelViewSet):
    queryset = Analysis.objects.all()
    serializer_class = AnalysesSerializer
    permission_classes = [permissions.AllowAny]


class DockerProcessesViewSet(viewsets.ModelViewSet):
    queryset = DockerProcess.objects.all()
    serializer_class = DockerProcessesSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer, *args, **kwargs):
        """
        Called within the create method to serializer for creation.
        Extended to start new docker container with given attributes.
        """
        # TODO: Change owner of file analysis here when frontend ready
        # dp_from_db = serializer.save(owner=self.request.user)
        dp_from_db = serializer.save(owner=User.objects.get(pk=1))
        # working_dir should be /../ddueruem-web
        dp_from_db.working_directory = f"{Path(__file__).resolve().parent.parent.parent.parent}{os.path.sep}{dp_from_db.id}_{dp_from_db.file_to_analyse.label}"
        dp_from_db.save()
        Process(target=start_analysis, args=(dp_from_db,)).start()
