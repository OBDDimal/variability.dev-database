from django.contrib import admin
from .models import User
from .viewsets import UserViewSet


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'institute', 'is_staff', 'date_joined')


# Register your models here.
admin.site.register(User, UserAdmin)
