from rest_framework import routers
from core.user.viewsets import UserViewSet
from core.auth.viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet

# routes = SimpleRouter()
router = routers.DefaultRouter()

# DEFAULT

# ADMIN
router.register(r'admin', UserViewSet, basename='admin')


# AUTHENTICATION
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/register', RegistrationViewSet, basename='auth-register')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')

# USER
router.register(r'user', UserViewSet, basename='user')

urlpatterns = [
    *router.urls
]
