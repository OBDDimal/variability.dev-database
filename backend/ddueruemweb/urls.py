# from django.contrib import admin
from django.urls import include, path
from core.admin import admin, send_activation_email
from core import routers

# DO NOT ADD NEW PATHS HERE. Do this in core/routers.py
urlpatterns = [
    # (re)send activation email for admin panel
    path('<int:user_id>/send-email', send_activation_email, name='send-activation-email'),
    # needs to be before django rest import
    path('admin/', admin.site.urls),
    path('', include(routers)),
]
