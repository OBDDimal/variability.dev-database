# from django.contrib import admin
from django.urls import include, path
from core.admin import admin
from core import routers

# DO NOT ADD NEW PATHS HERE. Do this in core/routers.py
urlpatterns = [
    path('admin/', admin.site.urls),  # needs to be on first place
    path('', include(routers)),
]
