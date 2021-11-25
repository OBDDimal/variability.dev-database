from django.contrib import admin
from django.contrib.admin import ModelAdmin

from core.fileupload.models import File
from core.user.forms import AdminUserChangeForm, AdminUserCreationForm
from core.user.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


class UserAdmin(BaseUserAdmin):
    """
    Class for defining the backend user admin panel, its used forms and which data should be displayed.
    """
    model = User
    form = AdminUserChangeForm
    add_form = AdminUserCreationForm
    # Shows attributes in list view
    list_display = ('email', 'institute', 'is_active', 'is_staff', 'is_superuser', 'last_login', 'date_joined')
    list_filter = ('is_superuser',)
    # Define how view should look like after clicking on a email
    fieldsets = [
        (None, {'fields': ['email', 'password']}),
        ('Personal Information', {'fields': ['institute', 'bio']}),
        # groups and user_permissions come from PermissionsMixin
        ('Permissions', {'fields': ['is_staff', 'is_active', 'groups', 'user_permissions']}),
        ('Important dates', {'fields': ['last_login']})
    ]
    # add_fieldsets is not a standard ModelAdmin attribute.
    # UserAdmin overrides get_fieldsets to use this attribute when creating a user.
    # otherwise it would throw the following error when trying to add a new user
    # "The value of 'ordering[0]' refers to 'username', which is not an attribute of 'core_user.User'"
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()


class FileAdmin(ModelAdmin):
    """
    Class for defining the backend file admin panel and which data should be displayed.
    """
    model = File
    # Shows attributes in list view
    list_display = ('file', 'owner', 'uploaded_at')
    # list_filter = ('is_superuser',)
    # Define how view should look like after clicking on a email
    fieldsets = [
        (None, {'fields': ['owner']}),
        ('Information', {'fields': ['description', 'uploaded_at', 'file']}),
    ]
    search_fields = ('owner',)
    ordering = ('owner', 'uploaded_at')
    filter_horizontal = ()


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(File, FileAdmin)
