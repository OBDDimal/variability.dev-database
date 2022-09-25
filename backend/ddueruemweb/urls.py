# from django.contrib import admin
from django.urls import include, path
from core.admin import admin, send_activation_email
from core import routers
from django.views.generic import RedirectView
from core.auth.viewsets import GithubLogin, GithubRedirect
from django.conf import settings
# Frontend URLs

# URL patterns

# DO NOT ADD NEW PATHS HERE. Do this in core/routers.py
urlpatterns = [
    # (re)send activation email for admin panel
    path('<int:user_id>/send-email', send_activation_email, name='send-activation-email'),
    # needs to be before django rest import
    path('admin/', admin.site.urls),
    path('', include(routers)),
]

if settings.GITHUB_AUTH:
    github_auth = [
        path('redirect/',
            GithubRedirect.as_view(),
            name='github_redirect'),
        path('login/',
            GithubLogin.as_view(),
            name='github_login',
        ),
        path('callback/',
            RedirectView.as_view(url=settings.GITHUB_AUTH_CALLBACK, query_string=True),
            name='github_callback'),
    ]

    urlpatterns.append(path('auth/github/', include(github_auth)))
