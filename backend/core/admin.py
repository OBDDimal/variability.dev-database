from core.fileupload.models import Family, License, Tag, File
from core.analysis.models import Analysis, DockerProcess
from core.user.forms import AdminUserChangeForm, AdminUserCreationForm
from core.user.models import User
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.utils import timezone
from datetime import timedelta
from django.contrib.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.admin.templatetags.admin_list import _boolean_icon
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
from django.contrib.admin.views.decorators import staff_member_required


@staff_member_required
def send_activation_email(request, user_id):
    """
    Function based view for resending activation link in the admin panel only.
    """
    User.objects.get(pk=user_id).send_activation_link()
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


class UserAdmin(BaseUserAdmin):
    """
    Class for defining the backend user admin panel, its used forms and which data should be displayed.
    """
    model = User
    form = AdminUserChangeForm
    add_form = AdminUserCreationForm
    # Show attributes in overall list view
    list_display = ('id', 'email', 'institute', 'is_active_ex', 'is_staff', 'is_superuser', 'last_login', 'date_joined')
    list_filter = ('institute', 'is_active', 'is_staff', 'is_superuser', 'last_login', 'date_joined')
    # Define which (and how) attributes should be displayed when clicking on a certain user
    fieldsets = [
        (None, {'fields': ['email', 'password']}),
        ('Personal Information', {'fields': ['institute', 'bio']}),
        # groups and user_permissions come from PermissionsMixin
        ('Permissions', {'fields': ['is_staff', 'is_active', 'groups', 'user_permissions']}),
        ('Important dates', {'fields': ['last_login', 'date_joined']})
    ]
    readonly_fields = ('date_joined',)
    # add_fieldsets is not a standard ModelAdmin attribute.
    # UserAdmin overrides get_fieldsets to use this attribute when creating a user.
    # otherwise, it would throw the following error when trying to add a new user
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

    @staticmethod
    def is_active_ex(user):
        """
        Extended is_active attribute which either is true or returns
        how much time is left (Hh:Mm:Ss) until the activation period ends.
        :return:
        """

        delta = (user.date_joined + timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)) - timezone.now()
        total_minute, second = divmod(delta.seconds, 60)
        hour, minute = divmod(total_minute, 60)

        return _boolean_icon(True) if user.is_active else f"{delta.days}d{hour}h{minute:02}m{second:02}s"


class LicenseAdmin(ModelAdmin):
    """
    Class for defining the backend License admin panel.
    """
    model = License
    list_display = ('id', 'label')
    fieldsets = [
        (None, {'fields': ['label']}),
    ]
    search_fields = ('id', 'label')
    ordering = ('label',)
    filter_horizontal = ()


class FamilyAdmin(ModelAdmin):
    """
    Class for defining the backend Feature Model Family admin panel.
    """
    model = Family
    list_display = ('id', 'label', 'owner')
    fieldsets = [
        (None, {'fields': ['owner']}),
        ('Information',
         {'fields': ['label', 'description']}),
    ]
    search_fields = ('owner', 'id')
    ordering = ('owner',)
    filter_horizontal = ()


class TagAdmin(ModelAdmin):
    """
    Class for defining the backend tag admin panel and which data should be displayed.
    """
    model = Tag
    list_display = ('id', 'label', 'is_public', 'owner', 'date_created')
    fieldsets = [
        (None, {'fields': ['id']}),
        ('Information', {'fields': ['label', 'is_public', 'owner', 'description']}),
        ('Important dates', {'fields': ['date_created']})
    ]
    readonly_fields = ('id', 'date_created',)
    search_fields = ('owner',)
    ordering = ('owner', 'date_created')
    filter_horizontal = ()


class FileAdmin(ModelAdmin):
    """
    Class for defining the backend file admin panel and which data should be displayed.
    """
    model = File
    list_display = (
    'id', 'new_version_of', 'is_confirmed_ex', 'mirrored', 'family', 'local_file', 'owner', 'uploaded_at')
    fieldsets = [
        (None, {'fields': ['owner']}),
        ('Information',
         {'fields': ['label', 'description', 'is_confirmed', 'mirrored', 'family', 'local_file', 'license', 'tags',
                     'new_version_of']}),
        ('Important dates', {'fields': ['uploaded_at']}),
        ('Transpiler Output', {'fields': ['transpiled_file']})
    ]
    readonly_fields = ('uploaded_at',)
    search_fields = ('owner', 'family')
    ordering = ('owner', 'uploaded_at')
    filter_horizontal = ()

    @staticmethod
    def is_confirmed_ex(file):
        """
        Extended is_confirmed attribute which either is true or returns
        how much time is left (Hh:Mm:Ss) until the activation period ends.
        :return:
        """

        delta = (file.uploaded_at + timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)) - timezone.now()
        total_minute, second = divmod(delta.seconds, 60)
        hour, minute = divmod(total_minute, 60)

        return _boolean_icon(True) if file.is_confirmed else f"{delta.days}d{hour}h{minute:02}m{second:02}s"


class AnalysisAdmin(ModelAdmin):
    """
    Class for defining the backend Analysis admin panel.
    """
    model = Analysis
    list_display = ('id', 'order', 'process')
    fieldsets = [
        (None, {'fields': ['process', 'order', 'report']}),
    ]
    search_fields = ('id', 'process')
    ordering = ('id',)
    filter_horizontal = ()


class DockerProcessAdmin(ModelAdmin):
    """
    Class for defining the backend DockerProcess admin panel.
    """
    model = DockerProcess
    list_display = ('id', 'working', 'owner', 'library')
    fieldsets = [
        (None, {'fields': ['owner', 'working', 'file_to_analyse', 'resources', 'library']}),
    ]
    search_fields = ('id', 'owner', 'library')
    ordering = ('id',)
    filter_horizontal = ()


# Register your models here.
admin.site.register(License, LicenseAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Family, FamilyAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(Analysis, AnalysisAdmin)
admin.site.register(DockerProcess, DockerProcessAdmin)
