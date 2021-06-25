from django.urls import path
from . import views

urlpatterns = [

    path('', views.overview, name ='overview'),
    path('new/', views.new, name='new-analysis'),

]