"""
This needs to be done because Django looks in app.models for an app's models.
Details: https://stackoverflow.com/questions/5534206/how-do-i-separate-my-models-out-in-django
"""
from .tag import Tag
from .file import File

