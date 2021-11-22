from django import forms
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ObjectDoesNotExist
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from core.user.serializers import UserSerializer
from core.user.models import User
from .tokens import generate_one_time_link


class LoginSerializer(TokenObtainPairSerializer):
    """
    A serializer for defining which attributes should be converted to JSON after successful login
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data['user'] = UserSerializer(self.user).data
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data


class RegistrationSerializer(UserSerializer):
    """
    A serializer for defining which attributes should be converted to JSON after successful registration.
    This serializer extends the user serializer in core/user/serializers.py.
    """
    password1 = serializers.CharField(label='Password', required=True, style={'input_type': 'password'},
                                      write_only=True)
    password2 = serializers.CharField(label='Password confirmation', required=True,
                                      style={'input_type': 'password'},
                                      write_only=True)

    class Meta:
        model = User
        # password1 and password2 needs to be contained in fields, but have write_only flag so they won't be serialized
        # other fields will be returned as JSON after successful user creation
        fields = ['email', 'password1', 'password2', 'is_active', 'is_staff']

    def create(self, validated_data):
        password1 = validated_data.pop("password1")
        password2 = validated_data.pop("password2")
        if password1 != password2:
            raise serializers.ValidationError({'message': "The two password fields didn't match."})
        else:
            validated_data.update({
                'password': password1
            })
            try:
                user = User.objects.get(email=validated_data['email'])
            except ObjectDoesNotExist:
                user = User.objects.create_user(**validated_data)

                extended_user = {
                    'id': str(user.id),
                    'email': str(user.email),
                    'timestamp': str(timezone.now()),
                }
                user.email_user("DDueruem Account Activation", render_to_string('email/user_activation_email.html', {
                    'user': str(user.email),
                    'protocol': 'http',
                    'domain': 'localhost:8000/auth/register/confirm/',
                    'token': generate_one_time_link(extended_user)
                }))
                return user
