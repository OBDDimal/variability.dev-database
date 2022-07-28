from core.fileupload.models import File
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow owners of objects to update them. See https://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class IsOriginalOwner(permissions.BasePermission):
    """
    This permissions checks whether the user uploading a new version of a file is also the owner of the original file.
    """

    def has_permission(self, request, view):
        if 'new_version_of' in request.data:
            original_file = File.objects.get(id=int(request.data['new_version_of']))
            owner = original_file.owner
            if owner != request.user:
                return False
        return True
