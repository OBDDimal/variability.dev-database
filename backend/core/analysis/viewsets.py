import logging
import os
from pathlib import Path
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import AnalysisData
from .serializers import AnalysisDataSerializer
from core.user.models import User
from multiprocessing import Process

logger = logging.getLogger(__name__)


class AnalysisDataViewSet(viewsets.ModelViewSet):
    queryset = AnalysisData.objects.all()
    serializer_class = AnalysisDataSerializer

    def get_queryset(self):
        # Extract parameters from the request
        model_ids_str = self.request.query_params.get('model_id', '')
        data_key = self.request.query_params.get('key')

        # Split the comma-separated string into a list of model_ids
        model_ids = [int(model_id) for model_id in model_ids_str.split(',') if model_id.isdigit()]

        # Return data for the specified model_ids and key
        return self.queryset.filter(file__id__in=model_ids, key=data_key)

    def list(self, request, *args, **kwargs):
        # Override list method to customize response
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

