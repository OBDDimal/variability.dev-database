from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.auth.serializers import LoginSerializer, RegistrationSerializer
from allauth.socialaccount.models import SocialLogin
from allauth.socialaccount.providers.base import AuthAction
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.views import APIView
from django.core.exceptions import PermissionDenied
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class CallbackSerializer(SocialLoginSerializer):
    state = serializers.CharField()

    def validate_state(self, value):
        try:
            SocialLogin.verify_and_unstash_state(
                self.context["request"],
                value,
            )
        except PermissionDenied:
            raise ValidationError("Invalid state.")
        return value


class CallbackMixin:
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    serializer_class = CallbackSerializer

    @property
    def callback_url(self):
        url = self.adapter_class(self.request).get_callback_url(
            self.request,
            None,
        )
        return url


class GithubLogin(CallbackMixin, SocialLoginView):
    ...


class GithubRedirect(APIView, OAuth2LoginView):
    adapter_class = GitHubOAuth2Adapter
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        adapter = self.adapter_class(request)
        self.adapter = adapter
        provider = adapter.get_provider()
        app = provider.get_app(self.request)
        client = self.get_client(request, app)
        action = AuthAction.AUTHENTICATE
        auth_url = adapter.authorize_url
        auth_params = provider.get_auth_params(request, action)
        client.state = SocialLogin.stash_state(request)
        try:
            return Response({"url": client.get_redirect_url(auth_url, auth_params)})
        except OAuth2Error as e:
            raise ValidationError("OAuth2 error.")


class LoginViewSet(ModelViewSet, TokenObtainPairView):
    """
    Define the login view set for the backend with needed serializer
    """

    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegistrationViewSet(ModelViewSet):
    """
    Define the registration view set for the backend with needed serializer
    """

    serializer_class = RegistrationSerializer
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        res = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

        return Response(
            {
                "user": serializer.data,
                "refresh": res["refresh"],
                "token": res["access"],
            },
            status=status.HTTP_201_CREATED,
        )


class RefreshViewSet(ViewSet, TokenRefreshView):
    """
    Define the token refresh view set for the backend with needed serializer
    """

    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
