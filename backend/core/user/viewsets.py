from datetime import timedelta
from django.core.signing import Signer, BadSignature
from django.utils import timezone, dateparse
from rest_framework.response import Response
from core.user.serializers import UserSerializer
from core.user.models import User
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.mixins import CreateModelMixin
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS
from ..auth.tokens import get_attributes_of_one_time_link


class UserViewSet(ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ActivateUserViewSet(GenericViewSet, CreateModelMixin):
    permission_classes = [AllowAny]
    http_method_names = ['get']

    @staticmethod
    def get(request, token):
        try:
            user = get_attributes_of_one_time_link(token)
            actual_request_timestamp = dateparse.parse_datetime(user.pop('timestamp'))
            min_possible_request_timestamp = timezone.now() - timedelta(days=PASSWORD_RESET_TIMEOUT_DAYS)
            valid = min_possible_request_timestamp <= actual_request_timestamp
            print('actual: ' + str(actual_request_timestamp))
            print('minimal: ' + str(min_possible_request_timestamp))
            print(valid)
            if not valid:
                raise BadSignature('Token expired!')
            else:
                user_from_db = User.objects.get(email=user['email'])
                user_from_db.is_active = True
                user_from_db.save()
                return Response({'user': UserSerializer(user_from_db).data})
        except BadSignature:
            return Response({'message': 'Token invalid. Did it expire?'})
