from django.apps import AppConfig


class UserConfig(AppConfig):
    name = 'core.user'
    label = 'core_user'  # This will be used in INSTALLED_APPS in settings.py
