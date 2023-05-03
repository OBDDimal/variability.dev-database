from rest_framework import serializers


class ConfigurationRequestSerializer(serializers.Serializer):
    config = serializers.ListField()
    selected_roots = serializers.ListField()
    available_roots = serializers.ListField()


class DecisionPropagationSerializer(serializers.Serializer):
    config = serializers.ListField()
    selected_roots = serializers.ListField()
    count = serializers.IntegerField()
    free_vars = serializers.ListField()
    available_vars = serializers.ListField()
    implicit_selected_vars = serializers.ListField()
    implicit_deselected_vars = serializers.ListField()
    available_roots = serializers.ListField()
    deselected_roots = serializers.ListField()

