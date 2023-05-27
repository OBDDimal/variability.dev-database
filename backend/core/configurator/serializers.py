from rest_framework import serializers


class ConfigurationRequestSerializer(serializers.Serializer):
    name = serializers.CharField()
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


class ConfigurationMappingsSerializer(serializers.Serializer):
    features_mapping = serializers.ListField()
    root_mapping = serializers.ListField()


class ExplanationsSerializer(serializers.Serializer):
    vars = serializers.ListField()
    config = serializers.ListField()
    selected_roots = serializers.ListField()
