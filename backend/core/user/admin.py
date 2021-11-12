from django.contrib import admin
from .models import User
from .viewsets import UserViewSet
from .forms import AdminUserCreationFrom


class UserAdmin(admin.ModelAdmin):
    model = User
    # Shows attributes in list view
    list_display = ('email', 'institute', 'is_staff', 'last_login', 'date_joined')
    # Define how view should look like after clicking on a email
    fieldsets = [
        ('Personal Information', {'fields': ['email', 'password', 'institute', 'bio']}),
        # groups and user_permissions come from PermissionsMixin
        ('Permissions', {'fields': ['is_staff', 'is_active', 'groups', 'user_permissions']}),
        ('Important dates', {'fields': ['last_login']})
    ]


# Register your models here.
admin.site.register(User, UserAdmin)
