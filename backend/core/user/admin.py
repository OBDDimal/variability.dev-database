from django.contrib import admin
from .models import User
from .viewsets import UserViewSet

# Register your models here.
admin.site.register(User)
#admin.register(User, UserViewSet)
