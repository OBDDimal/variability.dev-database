from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.core.signing import BadSignature
from django.utils import timezone, dateparse
from django.utils.encoding import DjangoUnicodeDecodeError
from rest_framework.response import Response
from core.user.serializers import UserSerializer
from core.user.models import User
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import AllowAny
from rest_framework.mixins import CreateModelMixin
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
from ..auth.tokens import decode_token_to_user


class UserViewSet(ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ActivateUserViewSet(GenericViewSet, CreateModelMixin):
    """
    This view is called when the user tries to activate the user account, via a link which contains a token.
    This token will be decoded and the user will be set to active if the token is valid.
    """
    permission_classes = [AllowAny]
    http_method_names = ['get']

    @staticmethod
    def get(request, token):
        try:
            user = decode_token_to_user(token)
            actual_request_timestamp = dateparse.parse_datetime(user.pop('timestamp'))
            if user.pop('purpose') != 'user_activation':
                raise BadSignature('Token purpose does not match!')
            min_possible_request_timestamp = timezone.now() - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
            valid = min_possible_request_timestamp <= actual_request_timestamp
            if not valid:
                raise BadSignature('Token expired!')
            else:
                user_from_db = User.objects.get(email=user['email'])
                if user_from_db.is_active:
                    raise BadSignature('User is already activated!')
                user_from_db.is_active = True
                user_from_db.save()
                return Response({'user': UserSerializer(user_from_db).data})
        except ObjectDoesNotExist as error:
            return Response({'message': str(error)})
        except BadSignature as error:
            return Response({'message': str(error)})
        except DjangoUnicodeDecodeError as error:
            return Response({'message': str(error)})
