from django.urls import path, include
from rest_framework import routers

from core.fileupload import views
from core.fileupload.views import FileUploadViewSet, GetOneFileViewSet
from core.user.viewsets import UserViewSet, ActivateUserViewSet
from core.auth.viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet

router = routers.DefaultRouter()

# Register new routes for backend here and link it to its view set

# AUTHENTICATION
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/register', RegistrationViewSet, basename='auth-register')
router.register(r'auth/register/confirm/(?P<token>[\w\d]+)', ActivateUserViewSet, basename='auth-register-confirm')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')

# USER
router.register(r'user', UserViewSet, basename='user')

# FILES
router.register(r'files', FileUploadViewSet, basename='file-upload')
router.register(r'files/(?P<path>.+)', views.download, basename='file-download')

urlpatterns = [
    *router.urls,
    path('api-auth/', include('rest_framework.urls')),
]
