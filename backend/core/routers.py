from django.conf.urls.static import static
from django.urls import path, re_path, include
from rest_framework import routers
from core.fileupload.viewsets import (
    BulkUploadApiView,
    FamiliesViewSet,
    FileUploadViewSet,
    TagsViewSet,
    LicensesViewSet,
    ConfirmedFileViewSet,
    UnconfirmedFileViewSet,
    ConfirmFileUploadApiView,
    DeleteFileUploadApiView,
)
from core.analysis.viewsets import AnalysesViewSet, DockerProcessesViewSet
from core.user.viewsets import ActivateUserViewSet, UserInfoApiView
from core.auth.viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet
from ddueruemweb.settings import STATIC_ROOT, STATIC_URL, MEDIA_URL, MEDIA_ROOT

# Register new routes for backend here
router = routers.DefaultRouter()


# FEATURE MODEL RELATED
# details file upload https://djangotricks.blogspot.com/2020/03/how-to-upload-a-file-using-django-rest-framework.html
router.register(r"files", FileUploadViewSet, basename="file-upload")
router.register(
    r"files/uploaded/confirmed", ConfirmedFileViewSet, basename="confirmed-files"
)
router.register(
    r"files/uploaded/unconfirmed", UnconfirmedFileViewSet, basename="unconfirmed-files"
)
router.register(r"tags", TagsViewSet, basename="tags")
router.register(r"licenses", LicensesViewSet, basename="licenses")
router.register(r"families", FamiliesViewSet, basename="families")
router.register(r"analysis", AnalysesViewSet, basename="analysis")
router.register(r"docker", DockerProcessesViewSet, basename="docker")


urlpatterns = [
    *router.urls,
    path("api-auth/", include("rest_framework.urls")),
    path("user-info/", UserInfoApiView.as_view()),
]
urlpatterns += static(STATIC_URL, document_root=STATIC_ROOT)
urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)
