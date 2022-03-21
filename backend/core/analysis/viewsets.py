import logging
from pathlib import Path
from rest_framework import viewsets, permissions
from .models import Analysis, DockerProcess
from .serializers import AnalysesSerializer, DockerProcessesSerializer
from ..user.models import User
from .docker_manager import start_or_queue_process

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
        # dp_from_db = serializer.save(owner=self.request.user)
        dp_from_db = serializer.save(owner=User.objects.get(pk=1))
        logger.info('starting docker container...')
        # should be /../ddueruem-web
        work_dir = f'{Path(__file__).resolve().parent.parent.parent.parent}'
        logger.info(f'init docker with p2wdir={work_dir}')
        start_or_queue_process(dp_from_db, work_dir)
