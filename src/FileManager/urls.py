from django.urls import path

from . import views

urlpatterns = [
    #file list
    path('', views.index, name='index'),
    #files that were merged into the main repo
    path('accepted/', views.accepted),
    #upload form for new files
    path('upload/', views.upload_file),
    #view details for a specific file
    path('<str:file_hash>/', views.file_data),
    #display raw content of uploaded files
    path('<str:file_hash>/raw/', views.file_raw, name='raw'),
]