from django import forms
from django.contrib.auth.forms import UserCreationForm as UserFrom
from .models import User


class AdminUserCreationFrom(UserFrom):
    class Meta:
        model = User
        fields = "__all__"
