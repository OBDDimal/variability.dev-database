# from django.contrib import admin
from django.urls import include, path
from core.user.admin import admin
from core import routers

urlpatterns = [
    path('admin/', admin.site.urls),  # needs to be on first place
    path('', include(routers)),
    path('api/', include(('core.routers', 'core'), namespace='core-api')),
]
