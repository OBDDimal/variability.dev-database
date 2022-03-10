import logging
import os
from pathlib import Path

from rest_framework import viewsets, permissions

from .docker_utils import create_or_reuse_image, _delete_image
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
        # serializer.save(owner=self.request.user)
        dp_from_db = serializer.save(owner=User.objects.get(pk=1))
        logger.warning('starting docker container...')
        work_dir = f'{Path(__file__).resolve().parent}{os.path.sep}newAnalysis'
        logger.warning('Deleting image ...')
        print(_delete_image())
        logger.warning('done!')
        logger.warning('Check image ...')
        create_or_reuse_image(work_dir)
        logger.warning('done!')
        logger.warning('Start Docker process ...')
        start_or_queue_process(dp_from_db)
        logger.warning('done!')
