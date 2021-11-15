from core.user.models import User
from rest_framework import serializers


# class UserSerializer(serializers.HyperlinkedModelSerializer):
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = ['url', 'id', 'email', 'is_active', 'institute', 'date_joined']
        fields = ['id', 'email', 'is_active', 'institute', 'date_joined']
        # read_only_field = ['is_active', 'created', 'updated', 'date_joined']
