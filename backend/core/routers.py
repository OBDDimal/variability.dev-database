from django.conf.urls.static import static
from django.urls import path, include
from rest_framework import routers

from core.fileupload import views
from core.fileupload.views import FileUploadViewSet, TagsViewSet
from core.user.viewsets import  ActivateUserViewSet
from core.auth.viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet
from ddueruemweb.settings import STATIC_ROOT, STATIC_URL, MEDIA_URL, MEDIA_ROOT

router = routers.DefaultRouter()

# Register new routes for backend here and link it to its view set

# AUTHENTICATION
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/register', RegistrationViewSet, basename='auth-register')
router.register(r'auth/register/confirm/(?P<token>[\w\d]+)', ActivateUserViewSet, basename='auth-register-confirm')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')


# FILES
router.register(r'files', FileUploadViewSet, basename='file-upload')

# TAGS
router.register(r'tags', TagsViewSet, basename='tags')
# details file upload https://djangotricks.blogspot.com/2020/03/how-to-upload-a-file-using-django-rest-framework.html
# router.register(r'^media/files/(?P<filename>[^/]+)$', FileUploadViewSet, basename='file-view')
# router.register(r'files/(?P<path>.+)', views.download, basename='file-download')

urlpatterns = [
    *router.urls,
    path('api-auth/', include('rest_framework.urls')),
]
urlpatterns += static(STATIC_URL, document_root=STATIC_ROOT)
urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
