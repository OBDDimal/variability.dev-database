from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow owners of objects to update them. See https://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class IsAdminToAddPublicTag(permissions.BasePermission):
    """
    This permissions checks whether the user adding a public tag is an admin.
    """

    def has_permission(self, request, view):
        if request.method == 'POST' and 'is_public' in request.data and request.data['is_public'] == 'True' and not request.user.is_staff:
            return False
        return True

