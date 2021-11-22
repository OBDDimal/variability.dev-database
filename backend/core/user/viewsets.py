from django.core.signing import Signer, BadSignature
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from core.user.serializers import UserSerializer
from core.user.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from ddueruemweb.settings import PASSWORD_RESET_TIMEOUT_DAYS


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ActivateUserViewSet(viewsets.GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get(self, request, token):
        signer = Signer()
        try:
            user = signer.unsign_object((force_str(urlsafe_base64_decode(token))))
            timestamp = user.pop('timestamp')
            valid = (timezone.now() - timestamp).total_seconds() < PASSWORD_RESET_TIMEOUT_DAYS * 24 * 60 * 60
            if not valid:
                raise BadSignature('Token expired!')
            else:
                user_from_db = User.objects.get(pk=user['email'])
                user_from_db.is_active = False
                user_from_db.save()
                return {'user': user_from_db}
        except BadSignature:
            return {'message': 'Token invalid. Did it expire?'}
