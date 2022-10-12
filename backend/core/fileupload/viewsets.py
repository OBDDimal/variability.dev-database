from core.analysis.models import DockerProcess, Analysis
from core.fileupload.models import Family, Tag, License, File
from core.fileupload.serializers import (
    FilesSerializer,
    TagsSerializer,
    FamiliesSerializer,
    LicensesSerializer,
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
from django.http.request import QueryDict

import json
import os
import binascii

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


class BulkUploadApiView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def generate_confirmation_token():
        return binascii.hexlify(os.urandom(30)).decode('ascii')

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

    def post(self, request, format=None):
        files = json.loads(request.data["files"])

        serializers = []
        confirmation_token = BulkUploadApiView.generate_confirmation_token()

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

    def _get_analysis_state(self, file):
        if file["owner"]:
            if DockerProcess.objects.filter(file_to_analyse_id=file["id"]).exists():
                docker_process = DockerProcess.objects.get(
                    file_to_analyse_id=file["id"]
                )
                if Analysis.objects.filter(process=docker_process):
                    return "Analyzed"
                elif docker_process.working:
                    return "Working"
                else:
                    return "Queued"
            else:
                return "Not started"

        return "Permission denied"

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = File.objects.filter(is_confirmed=True)
        familyId = self.request.query_params.get("family")
        if familyId is not None:
            queryset = queryset.filter(family__id=familyId).order_by("version")
        files = FilesSerializer(queryset, many=True).data
        anonymized_files = []
        for file in files:
            anonymized_file = anonymize_file(file, request)
            analysis_state = self._get_analysis_state(anonymized_file)
            anonymized_file["analysis"] = analysis_state
            anonymized_files.append(anonymized_file)
        return Response(anonymized_files)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_file = anonymize_file(serializer.data, request)
        analysis_state = self._get_analysis_state(anonymized_file)
        anonymized_file["analysis"] = analysis_state
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
        queryset = Family.objects.all()
        families = FamiliesSerializer(queryset, many=True).data
        anonymized_families = []
        for family in families:
            anonymized_families.append(self.anonymize_family(family, request))
        return Response(anonymized_families)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_family = self.anonymize_family(serializer.data, request)
        return Response(anonymized_family)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


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
