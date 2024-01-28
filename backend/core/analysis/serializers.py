from rest_framework import serializers

from rest_framework import serializers

from core.analysis.models import AnalysisData


class AnalysisDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisData
        fields = ['file', 'key', 'value']