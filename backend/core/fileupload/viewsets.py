from core.analysis.models import DockerProcess, Analysis
from core.fileupload.models import Family, Tag, License, File
from core.fileupload.serializers import FilesSerializer, TagsSerializer, FamiliesSerializer, LicensesSerializer
from core.fileupload.permissions import IsOwnerOrIsAdminOrReadOnly, IsAdminToAddPublicTag
from collections import OrderedDict
import logging
from django.utils import timezone, dateparse
from datetime import timedelta
from rest_framework.status import HTTP_405_METHOD_NOT_ALLOWED, HTTP_403_FORBIDDEN, HTTP_200_OK
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

logger = logging.getLogger(__name__)


    
def anonymize_file(file, request):
    """
    Replace email address of file owner with True or False,
    indicating whether the user which has sent the request is the owner.
    """
    user_email = "" if request.user.is_anonymous else request.user.email

    anonymized_file = OrderedDict()
    for (file_key, file_value) in file.items():
        if file_key == 'owner':
            anonymized_file[file_key] = file_value == user_email
        elif file_key == 'tags':
            tags = []
            for tag in list(file_value):
                new_tag = OrderedDict()
                for (tag_key, tag_value) in tag.items():
                    if tag_key == 'owner':
                        new_tag[tag_key] = tag_value == user_email
                    else:
                        new_tag[tag_key] = tag_value
                tags.append(new_tag)
            anonymized_file[file_key] = tags
        elif file_key == 'family':
            new_family = file_value
            new_family.update({'owner': new_family['owner'] == user_email})
            anonymized_file[file_key] = new_family
        else:
            anonymized_file[file_key] = file_value
    return anonymized_file


class ConfirmFileUploadViewSet(GenericViewSet, CreateModelMixin):
    """
    This view is called when the user tries to confirm  a file, via a link which contains a token.
    This token will be decoded and the file will be set to confirmed if the token is valid.
    """
    permission_classes = [AllowAny]
    http_method_names = ['get']

    @staticmethod
    def get(request, token):
        try:
            decoded_token = decode_token_to_user(token)
            actual_request_timestamp = dateparse.parse_datetime(decoded_token.pop('timestamp'))
            if decoded_token.pop('purpose') != 'upload_confirm':
                raise BadSignature('Token purpose does not match!')
            min_possible_request_timestamp = timezone.now() - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
            valid = min_possible_request_timestamp <= actual_request_timestamp
            if not valid:
                raise BadSignature('Token expired!')
            else:
                file_from_db = File.objects.get(pk=decoded_token.pop('file_id'))
                if file_from_db.is_confirmed:
                    raise BadSignature('File upload is already confirmed!')
                file_from_db.is_confirmed = True
                if not file_from_db.mirrored:
                    if not DEBUG:
                        # async start mirror. Details: https://docs.python.org/3/library/multiprocessing.html
                        mirror_process = Process(target=gm.mirror_to_github, args=(file_from_db,))
                        mirror_process.start()
                        file_from_db.mirrored = True
                    else:
                        logger.debug(" MODE: File mirror is disabled")
                file_from_db.save()
                return Response({'file': FilesSerializer(file_from_db).data}, HTTP_200_OK)
        except ObjectDoesNotExist as error:
            return Response({'message': str(error)})
        except BadSignature as error:
            return Response({'message': str(error)})
        except DjangoUnicodeDecodeError as error:
            return Response({'message': str(error)})


class FileUploadViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]

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

    def perform_create(self, serializer):
        """
        Called within the create method to serializer for creation
        """
        serializer.save(owner=self.request.user)
        self.request.user.send_link_to_file(serializer.data)


class UnconfirmedFileViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    queryset = File.objects.filter(is_confirmed=False)
    serializer_class = FilesSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrIsAdminOrReadOnly]

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
        return Response(anonymized_file)

    def destroy(self, request, *args, **kwargs):
        try:
            file = File.objects.get(pk=kwargs['pk'])
            if file.is_confirmed:
                return Response({'message': 'Cannot delete confirmed files.'}, HTTP_403_FORBIDDEN)
            file.delete()
        except ObjectDoesNotExist as error:
            return Response({'message': str(error)})
        return Response(status=HTTP_200_OK)


class ConfirmedFileViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    queryset = File.objects.filter(is_confirmed=True)
    serializer_class = FilesSerializer
    permission_classes = [permissions.AllowAny]

    def _get_analysis_state(self, file):
        if file['owner']:
            if DockerProcess.objects.filter(file_to_analyse_id=file['id']).exists():
                docker_process = DockerProcess.objects.get(file_to_analyse_id=file['id'])
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
        files = FilesSerializer(queryset, many=True).data
        anonymized_files = []
        for file in files:
            anonymized_file = anonymize_file(file, request)
            analysis_state = self._get_analysis_state(anonymized_file)
            anonymized_file['analysis'] = analysis_state
            anonymized_files.append(anonymized_file)
        return Response(anonymized_files)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        anonymized_file = anonymize_file(serializer.data, request)
        analysis_state = self._get_analysis_state(anonymized_file)
        anonymized_file['analysis'] = analysis_state
        return Response(anonymized_file)


class FamiliesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
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
            if key == 'owner':
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


class LicensesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    queryset = License.objects.all()
    serializer_class = LicensesSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, **kwargs):
        queryset = License.objects.all()
        licenses = LicensesSerializer(queryset, many=True).data
        return Response(licenses)


class TagsViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrIsAdminOrReadOnly, IsAdminToAddPublicTag]

    def public_or_owner(self, tag, request):
        user_email = "" if request.user.is_anonymous else request.user.email
        return tag['is_public'] or tag['owner'] == user_email

    def remove_private_tags(self, tags, request):
        public_tags = []
        for tag in tags:
            if self.public_or_owner(tag, request):
                public_tags.append(tag)
        return public_tags

    def anonymize_tag(self, tag, request):
        """
        Replace email address of tag owner with True or False,
        indicating whether the user which has sent the request is the owner.
        """
        anonymized_tag = OrderedDict()
        for (key, value) in tag.items():
            if key == 'owner':
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
        if not self.public_or_owner(serializer.data, request):
            return Response({"detail": "Not found."}, status.HTTP_404_NOT_FOUND)
        anonymized_tag = self.anonymize_tag(serializer.data, request)
        return Response(anonymized_tag)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
