from core.analysis.models import DockerProcess, Analysis
from core.fileupload.models import Family, Tag, License, File
from core.fileupload.serializers import FilesSerializer, TagsSerializer, FamiliesSerializer, LicensesSerializer
from core.fileupload.permissions import IsOwnerOrReadOnly
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
    permission_classes = [AllowAny]

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = File.objects.all()
        files = FilesSerializer(queryset, many=True).data
        changed_files = []
        for file in files:
            changed_file = OrderedDict()
            for tuple in file.items():
                if tuple[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_file[tuple[0]] = tuple[1] == user_mail
                elif tuple[0] == 'tags':
                    tags = []
                    for tag in list(tuple[1]):
                        new_tag = OrderedDict()
                        for tagTuple in tag.items():
                            if tagTuple[0] == 'owner':
                                user_mail = "" if request.user.is_anonymous else request.user.email
                                new_tag[tagTuple[0]] = tagTuple[1] == user_mail
                            else:
                                new_tag[tagTuple[0]] = tagTuple[1]
                        tags.append(new_tag)
                    changed_file[tuple[0]] = tags
                else:
                    changed_file[tuple[0]] = tuple[1]
            changed_files.append(changed_file)
        return Response(changed_files)

    def perform_create(self, serializer):
        """
        Called within the create method to serializer for creation
        """
        serializer.save(owner=self.request.user)
        self.request.user.send_link_to_file(serializer.data)


class UnconfirmedFileViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    queryset = File.objects.filter(is_confirmed=False)
    serializer_class = FilesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, **kwargs):
        """
        Replace email address of file owner with True or False,
        indicating if the user which has sent the request is the owner.
        Returns only the unconfirmed files of a user.
        """
        queryset = File.objects.filter(is_confirmed=False)
        files = FilesSerializer(queryset, many=True).data
        print(files)
        changed_files = []
        for file in files:
            changed_file = OrderedDict()
            for tuple in file.items():
                if tuple[0] == 'owner':
                    changed_file[tuple[0]] = tuple[1] == 'request.user.email'
                elif tuple[0] == 'tags':
                    tags = []
                    for tag in list(tuple[1]):
                        new_tag = OrderedDict()
                        for tagTuple in tag.items():
                            if tagTuple[0] == 'owner':
                                new_tag[tagTuple[0]] = tagTuple[1] == 'request.user.email'
                            else:
                                new_tag[tagTuple[0]] = tagTuple[1]
                        tags.append(new_tag)
                    changed_file[tuple[0]] = tags
                elif tuple[0] == 'family':
                    new_family = tuple[1]
                    new_family.update({'owner': new_family['owner'] == 'request.user.email'})
                    changed_file[tuple[0]] = new_family
                else:
                    changed_file[tuple[0]] = tuple[1]
            changed_files.append(changed_file)
        return Response(changed_files)

    def destroy(self, request, *args, **kwargs):
        try:
            file = File.objects.get(pk=kwargs['pk'])
            if file.is_confirmed:
                return Response({'message': 'Cannot delete confirmed files.'}, HTTP_403_FORBIDDEN)
            if file.owner.email != request.user.email:
                return Response({'message': 'File owner does not match.'}, HTTP_403_FORBIDDEN)
            file.delete()
        except ObjectDoesNotExist as error:
            return Response({'message': str(error)})
        return Response(status=HTTP_200_OK)


class ConfirmedFileViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    queryset = File.objects.filter(is_confirmed=True)
    serializer_class = FilesSerializer
    permission_classes = [AllowAny]

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
        changed_files = []
        for file in files:
            changed_file = OrderedDict()
            for tuple in file.items():
                if tuple[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_file[tuple[0]] = tuple[1] == user_mail
                elif tuple[0] == 'tags':
                    tags = []
                    for tag in list(tuple[1]):
                        new_tag = OrderedDict()
                        for tagTuple in tag.items():
                            if tagTuple[0] == 'owner':
                                user_mail = "" if request.user.is_anonymous else request.user.email
                                new_tag[tagTuple[0]] = tagTuple[1] == user_mail
                            else:
                                new_tag[tagTuple[0]] = tagTuple[1]
                        tags.append(new_tag)
                    changed_file[tuple[0]] = tags
                elif tuple[0] == 'family':
                    new_family = tuple[1]
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    new_family.update({'owner': new_family['owner'] == user_mail})
                    changed_file[tuple[0]] = new_family
                else:
                    changed_file[tuple[0]] = tuple[1]
            analysis_state = self._get_analysis_state(changed_file)
            changed_file['analysis'] = analysis_state
            changed_files.append(changed_file)
        return Response(changed_files)


class FamiliesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    queryset = Family.objects.all()
    serializer_class = FamiliesSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def list(self, request, **kwargs):
        """
        Replace email address of family owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = Family.objects.all()
        families = FamiliesSerializer(queryset, many=True).data
        changed_families = []
        for family in families:
            changed_family = OrderedDict()
            for item in family.items():
                if item[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_family[item[0]] = item[1] == user_mail
                else:
                    changed_family[item[0]] = item[1]
            changed_families.append(changed_family)
        return Response(changed_families)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        

class LicensesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    queryset = License.objects.all()
    serializer_class = LicensesSerializer
    permission_classes = [AllowAny]

    def list(self, request, **kwargs):
        queryset = License.objects.all()
        licenses = LicensesSerializer(queryset, many=True).data
        return Response(licenses)


class TagsViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin):
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def list(self, request, **kwargs):
        """
        Replace email address of tag owner with True or False,
        indicating if the user which has sent the request is the owner.
        """
        queryset = Tag.objects.all()
        tags = TagsSerializer(queryset, many=True).data
        changed_tags = []
        for tag in tags:
            changed_tag = OrderedDict()
            for tuple in tag.items():
                if tuple[0] == 'owner':
                    user_mail = "" if request.user.is_anonymous else request.user.email
                    changed_tag[tuple[0]] = tuple[1] == user_mail
                else:
                    changed_tag[tuple[0]] = tuple[1]
            changed_tags.append(changed_tag)
        return Response(changed_tags)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

