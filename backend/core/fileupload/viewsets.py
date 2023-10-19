from django.core.cache import cache
from django.db.models import Q
from rest_framework.request import Request

from core.fileupload.models import Family, Tag, License, File, Analysis, AnalysisResult
from core.fileupload.utils import generate_random_string
from core.fileupload.serializers import (
    FilesSerializer,
    TagsSerializer,
    FamiliesSerializer,
    LicensesSerializer,
    AnalysesSerializer,
    AnalysisResultsSerializer,
)
from core.fileupload.permissions import (
    IsOwnerOrIsAdminOrReadOnly,
    IsAdminToAddPublicTag,
)
from collections import OrderedDict
import logging
from django.utils import timezone, dateparse
from datetime import timedelta
from rest_framework.status import (
    HTTP_405_METHOD_NOT_ALLOWED,
    HTTP_403_FORBIDDEN,
    HTTP_200_OK,
)
from rest_framework import viewsets, permissions, mixins
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.signing import BadSignature
from django.utils.encoding import DjangoUnicodeDecodeError
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.mixins import CreateModelMixin
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS, DEBUG
from ..auth.tokens import decode_token_to_user
import core.fileupload.githubmirror.github_manager as gm
from multiprocessing import Process
from rest_framework.views import APIView
from django.http.request import QueryDict, HttpRequest

import json
import os
import binascii
import zipfile

logger = logging.getLogger(__name__)


def anonymize_file(file, request):
    """
    Replace email address of file owner with True or False,
    indicating whether the user which has sent the request is the owner.
    """
    user_email = "" if request.user.is_anonymous else request.user.email

    anonymized_file = OrderedDict()
    for (file_key, file_value) in file.items():
        if file_key == "owner":
            anonymized_file[file_key] = file_value == user_email
        elif file_key == "tags":
            tags = []
            for tag in list(file_value):
                new_tag = OrderedDict()
                for (tag_key, tag_value) in tag.items():
                    if tag_key == "owner":
                        new_tag[tag_key] = tag_value == user_email
                    else:
                        new_tag[tag_key] = tag_value
                tags.append(new_tag)
            anonymized_file[file_key] = tags
        elif file_key == "family":
            new_family = file_value
            new_family.update({"owner": new_family["owner"] == user_email})
            anonymized_file[file_key] = new_family
        else:
            anonymized_file[file_key] = file_value
    return anonymized_file


class ConfirmFileUploadApiView(APIView):
    """
    This view is called when the user tries to confirm files, via a link which contains a token.
    This token will be decoded and the files will be set to confirmed if the token is valid.
    """

    def get(self, request, token):
        if token == "":
            return Response(
                {"message": "Invalid confirmation token"}, status.HTTP_404_NOT_FOUND
            )

        files = File.objects.filter(confirmation_token=token)

        if files.count() == 0:
            return Response(
                {"message": "Invalid confirmation token"}, status.HTTP_404_NOT_FOUND
            )

        file_data = []

        for file in files:
            if file.is_confirmed:
                return Response(
                    {"message": "Files already confirmed"}, HTTP_403_FORBIDDEN
                )
            file.is_confirmed = True
            file.save()
            file_data.append(FilesSerializer(file).data)

        return Response({"files": file_data}, status.HTTP_201_CREATED)


class DeleteFileUploadApiView(APIView):
    """
    This view is called when the user tries to delete files, via a link which contains a token.
    This token will be decoded and the files will be deleted if the token is valid.
    """

    def get(self, request, token):
        if token == "":
            return Response(
                {"message": "Invalid confirmation token"}, status.HTTP_404_NOT_FOUND
            )

        files = File.objects.filter(confirmation_token=token)

        if files.count() == 0:
            return Response(
                {"message": "Invalid confirmation token"}, status.HTTP_404_NOT_FOUND
            )

        for file in files:
            if file.is_confirmed:
                return Response(
                    {"message": "Cannot delete confirmed files"}, HTTP_403_FORBIDDEN
                )
            file.delete()

        return Response({"files": []}, status.HTTP_204_NO_CONTENT)


class FileUploadViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
):
    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrIsAdminOrReadOnly]

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = File.objects.all()
        files = FilesSerializer(queryset, many=True).data
        anonymized_files = []
        for file in files:
            anonymized_files.append(anonymize_file(file, request))
        return Response(anonymized_files)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_file = anonymize_file(serializer.data, request)
        return Response(anonymized_file)


class UploadApiView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def check_family(self, request, family_id):
        family = Family.objects.get(pk=family_id)
        return family and family.owner == request.user

    def check_tags(self, request, tag_ids):
        for tag_id in tag_ids:
            tag = Tag.objects.get(pk=tag_id)
            if not tag:
                return False
            if not tag.is_public and tag.owner != request.user:
                return False
        return True

    def check_validity(self, request, family_id, tag_ids):
        if request.user.is_staff:
            return True

        return self.check_family(request, family_id) and self.check_tags(
            request, tag_ids
        )

    def schedule_analysis(self, fs):
        for analysis in Analysis.objects.filter(disabled=False, admin_only=False):
            analysis_result = AnalysisResult(analysis_id=analysis.id, file_id=fs.id)
            analysis_result.save()


class BulkUploadApiView(UploadApiView):
    def post(self, request, format=None):
        if not request.data["files"]:
            return Response(
                {"files": "This field may not be blank."},
                status.HTTP_400_BAD_REQUEST,
            )
        try:
            files = json.loads(request.data["files"])
        except:
            return Response(
                {"files": "This field must contain JSON."},
                status.HTTP_400_BAD_REQUEST,
            )

        serializers = []
        confirmation_token = generate_random_string(30)
        for uploaded_file in files:
            label = uploaded_file["label"]
            description = uploaded_file["description"]
            license = uploaded_file["license"]
            version = uploaded_file["version"]
            family = uploaded_file["family"]
            tags = uploaded_file["tags"]
            file = request.FILES[uploaded_file["file"]]

            validated_data = QueryDict("", mutable=True)
            validated_data["label"] = label
            validated_data["description"] = description
            validated_data["license"] = license
            validated_data["version"] = version
            validated_data["family"] = family
            validated_data.setlist("tags", tags)
            validated_data["local_file"] = file
            validated_data["confirmation_token"] = confirmation_token

            fs = FilesSerializer(data=validated_data)

            if not self.check_validity(request, family, tags):
                return Response(
                    {"message": "Upload not valid"}, status=status.HTTP_403_FORBIDDEN
                )
            if not fs.is_valid():
                return Response(
                    {"message": "File does not contain valid XML"},
                    status.HTTP_403_FORBIDDEN,
                )

            serializers.append(fs)

        uploaded = []
        for fs in serializers:
            fs.save(owner=request.user)
            self.schedule_analysis(fs)
            uploaded.append(fs.data)

        request.user.send_link_to_files(confirmation_token)

        return Response({"files": uploaded}, status=status.HTTP_201_CREATED)


class ZipUploadApiView(UploadApiView):
    def post(self, request, format=None):
        if not request.data["files"]:
            return Response(
                {"files": "This field may not be blank."},
                status.HTTP_400_BAD_REQUEST,
            )
        try:
            file_data = json.loads(request.data["files"])
        except:
            return Response(
                {"files": "This field must contain JSON."},
                status.HTTP_400_BAD_REQUEST,
            )

        label = file_data["label"]
        description = file_data["description"]
        license = file_data["license"]
        family = file_data["family"]
        tags = file_data["tags"]

        if not self.check_validity(request, family, tags):
            return Response(
                {"message": "Upload not valid"}, status=status.HTTP_403_FORBIDDEN
            )
        files = zipfile.ZipFile(request.FILES["file"])

        serializers = []
        confirmation_token = generate_random_string(30)
        for (i, uploaded_file) in enumerate(files.infolist()):
            local_file = SimpleUploadedFile(
                f"{generate_random_string(20)}.xml", files.read(uploaded_file)
            )

            validated_data = QueryDict("", mutable=True)
            validated_data["label"] = label
            validated_data["description"] = description
            validated_data["license"] = license
            validated_data["version"] = f"{i + 1}.0.0"
            validated_data["family"] = family
            validated_data.setlist("tags", tags)
            validated_data["local_file"] = local_file
            validated_data["confirmation_token"] = confirmation_token

            fs = FilesSerializer(data=validated_data)

            if not fs.is_valid():
                return Response(
                    {"message": "File does not contain valid XML"},
                    status.HTTP_403_FORBIDDEN,
                )

            serializers.append(fs)

        uploaded = []
        for fs in serializers:
            fs.save(owner=request.user)
            uploaded.append(fs.data)

        request.user.send_link_to_files(confirmation_token)

        return Response({"files": uploaded}, status=status.HTTP_201_CREATED)


class UnconfirmedFileViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
):
    queryset = File.objects.filter(is_confirmed=False)
    serializer_class = FilesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrIsAdminOrReadOnly]

    def list(self, request, **kwargs):
        """
        Returns only the unconfirmed files of a user.
        """
        queryset = File.objects.filter(is_confirmed=False)
        files = FilesSerializer(queryset, many=True).data
        anonymized_files = []
        for file in files:
            anonymized_files.append(anonymize_file(file, request))
        return Response(anonymized_files)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_file = anonymize_file(serializer.data, request)
        if instance.is_confirmed:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(anonymized_file)

    def destroy(self, request, *args, **kwargs):
        try:
            file = File.objects.get(pk=kwargs["pk"])
            if file.is_confirmed:
                return Response(
                    {"message": "Cannot delete confirmed files"}, HTTP_403_FORBIDDEN
                )
            file.delete()
        except ObjectDoesNotExist as error:
            return Response({"message": str(error)})
        return Response(status=HTTP_200_OK)


class ConfirmedFileViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
):
    queryset = File.objects.filter(is_confirmed=True)
    serializer_class = FilesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrIsAdminOrReadOnly]

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        """

        family_id = self.request.query_params.get("family")
        owner = self.request.query_params.get("owner")
        if family_id is not None and owner is not None:
            cache_key = f"confirmed_files_{family_id}_{owner}"
        elif family_id is not None:
            cache_key = f"confirmed_files_{family_id}_all"
        elif owner is not None:
            cache_key = f"confirmed_files_all_{owner}"
        else:
            cache_key = "confirmed_files_all"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)
        queryset = File.objects.filter(is_confirmed=True)
        filter_conditions = Q(is_confirmed=True)
        if family_id is not None:
            filter_conditions &= Q(family__id=family_id)
        if owner is not None:
            filter_conditions &= Q(owner=owner)
        queryset = (queryset.filter(filter_conditions).select_related('family', 'license').
                    prefetch_related('tags').order_by("version"))

        anonymized_files = [anonymize_file(FilesSerializer(file).data, request) for file in queryset]
        cache.set(cache_key, anonymized_files, 60 * 15)
        return Response(anonymized_files)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_file = anonymize_file(serializer.data, request)
        if not instance.is_confirmed:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(anonymized_file)


class FamiliesViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
):
    queryset = Family.objects.all()
    serializer_class = FamiliesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrIsAdminOrReadOnly]

    def anonymize_family(self, family, request):
        """
        Replace email address of family owner with True or False,
        indicating whether the user which has sent the request is the owner.
        """
        anonymized_family = OrderedDict()
        for (key, value) in family.items():
            if key == "owner":
                user_email = "" if request.user.is_anonymous else request.user.email
                anonymized_family[key] = value == user_email
            else:
                anonymized_family[key] = value
        return anonymized_family

    def list(self, request, **kwargs):
        cached_families = cache.get(f"families_cache_{request.user}")
        if cached_families is not None:
            return Response(cached_families)
        queryset = Family.objects.all()
        families = FamiliesSerializer(queryset, many=True).data
        anonymized_families = []
        for family in families:
            anonymized_families.append(self.anonymize_family(family, request))
        cache.set(f"families_cache_{request.user}", anonymized_families, 60 * 15)
        return Response(anonymized_families)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_family = self.anonymize_family(serializer.data, request)
        return Response(anonymized_family)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        cache_key = f"families_cache_{self.request.user}"
        cache.delete(cache_key)


class LicensesViewSet(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    queryset = License.objects.all()
    serializer_class = LicensesSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, **kwargs):
        queryset = License.objects.all()
        licenses = LicensesSerializer(queryset, many=True).data
        return Response(licenses)


class TagsViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsOwnerOrIsAdminOrReadOnly,
        IsAdminToAddPublicTag,
    ]

    def public_or_owner_or_admin(self, tag, request):
        user_email = "" if request.user.is_anonymous else request.user.email
        return tag["is_public"] or tag["owner"] == user_email or request.user.is_staff

    def remove_private_tags(self, tags, request):
        public_tags = []
        for tag in tags:
            if self.public_or_owner_or_admin(tag, request):
                public_tags.append(tag)
        return public_tags

    def anonymize_tag(self, tag, request):
        """
        Replace email address of tag owner with True or False,
        indicating whether the user which has sent the request is the owner.
        """
        anonymized_tag = OrderedDict()
        for (key, value) in tag.items():
            if key == "owner":
                user_email = "" if request.user.is_anonymous else request.user.email
                anonymized_tag[key] = value == user_email
            else:
                anonymized_tag[key] = value
        return anonymized_tag

    def list(self, request, **kwargs):
        queryset = Tag.objects.all()
        tags = TagsSerializer(queryset, many=True).data
        public_tags = self.remove_private_tags(tags, request)
        anonymized_tags = []
        for tag in public_tags:
            anonymized_tags.append(self.anonymize_tag(tag, request))
        return Response(anonymized_tags)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        if not self.public_or_owner_or_admin(serializer.data, request):
            return Response({"detail": "Not found."}, status.HTTP_404_NOT_FOUND)
        anonymized_tag = self.anonymize_tag(serializer.data, request)
        return Response(anonymized_tag)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AnalysesViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
):
    queryset = Analysis.objects.all()
    serializer_class = AnalysesSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
    ]

    def list(self, request, **kwargs):
        queryset = Analysis.objects.all()
        analyses = AnalysesSerializer(queryset, many=True).data
        return Response(analyses)


class AnalysisResultsViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultsSerializer

    def list(self, request, **kwargs):
        queryset = AnalysisResult.objects.all()
        analysisresults = AnalysisResultsSerializer(queryset, many=True).data
        return Response(analysisresults)
