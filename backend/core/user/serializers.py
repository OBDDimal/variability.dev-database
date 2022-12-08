from core.user.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    A serializer for defining which user attributes should be converted (to JSON)
    """

    class Meta:
        model = User
        fields = ['id', 'email', 'is_active', 'is_staff', 'institute', 'date_joined']
        # read_only_field = ['is_active', 'created', 'updated', 'date_joined']
