from django.conf.urls.static import static
from django.urls import path, include
from rest_framework import routers
from core.fileupload.viewsets import (
    BulkUploadApiView,
    FamiliesViewSet,
    FileUploadViewSet,
    TagsViewSet,
    LicensesViewSet,
    ConfirmedFileViewSet,
    UnconfirmedFileViewSet,
    ConfirmFileUploadViewSet,
    DeleteFileUploadViewSet,
)
from core.analysis.viewsets import AnalysesViewSet, DockerProcessesViewSet
from core.user.viewsets import ActivateUserViewSet
from core.auth.viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet
from ddueruemweb.settings import STATIC_ROOT, STATIC_URL, MEDIA_URL, MEDIA_ROOT

# Register new routes for backend here
router = routers.DefaultRouter()

# AUTHENTICATION
router.register(r"auth/login", LoginViewSet, basename="auth-login")
router.register(r"auth/register", RegistrationViewSet, basename="auth-register")
router.register(
    r"auth/register/confirm/(?P<token>[\w\d]+)",
    ActivateUserViewSet,
    basename="auth-register-confirm",
)
router.register(r"auth/refresh", RefreshViewSet, basename="auth-refresh")

# FEATURE MODEL RELATED
# details file upload https://djangotricks.blogspot.com/2020/03/how-to-upload-a-file-using-django-rest-framework.html
router.register(r"files", FileUploadViewSet, basename="file-upload")
router.register(
    r"files/uploaded/confirmed", ConfirmedFileViewSet, basename="confirmed-files"
)
router.register(
    r"files/uploaded/unconfirmed", UnconfirmedFileViewSet, basename="unconfirmed-files"
)
router.register(
    r"files/uploaded/unconfirmed/confirm/(?P<token>[\w\d]+)",
    ConfirmFileUploadViewSet,
    basename="confirm-upload",
)
router.register(
    r"files/uploaded/unconfirmed/delete/(?P<token>[\w\d]+)",
    DeleteFileUploadViewSet,
    basename="delete-upload",
)
router.register(r"tags", TagsViewSet, basename="tags")
router.register(r"licenses", LicensesViewSet, basename="licenses")
router.register(r"families", FamiliesViewSet, basename="families")
router.register(r"analysis", AnalysesViewSet, basename="analysis")
router.register(r"docker", DockerProcessesViewSet, basename="docker")


urlpatterns = [
    *router.urls,
    path("bulk-upload/", BulkUploadApiView.as_view()),
    path("api-auth/", include("rest_framework.urls")),
]
urlpatterns += static(STATIC_URL, document_root=STATIC_ROOT)
urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
