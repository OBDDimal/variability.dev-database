from core.user.models import ExtendedUser
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtendedUser
        fields = ['id', 'username', 'email', 'is_active', 'institute']
        read_only_field = ['is_active', 'created', 'updated']
