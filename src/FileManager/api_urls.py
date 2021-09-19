from django.urls import path, include

from . import api_views
from .models import File


urlpatterns = [
    # file list
    path('', api_views.index),
    path('feature-models/', api_views.feature_models),
    path('feature-model/<hash>/', api_views.feature_model),
    path('feature-model/<hash>/analysis/',api_views.feature_model_analysis),
]
