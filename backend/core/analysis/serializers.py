from rest_framework import serializers

from core.analysis.models import Analysis, DockerProcess


class AnalysesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which Analysis attributes should be converted to JSON
    """

    class Meta:
        model = Analysis
        fields = ['id', 'report', 'order']


class DockerProcessesSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which DockerProcess attributes should be converted to JSON
    """
    owner = serializers.ReadOnlyField(source='owner.email')
    class Meta:
        model = DockerProcess
        fields = ['id', 'file_to_analyse', 'resources', 'owner', 'library']
