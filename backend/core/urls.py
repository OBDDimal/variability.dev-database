from django.conf.urls import include, url

# from .views import home, dashboard

urlpatterns = [
    url("accounts/", include("django.contrib.auth.urls")),
    # url("dashboard/", dashboard, name="dashboard"),
    # url("home/", home, name="home"),
]
