from django.urls import path
from . import views

urlpatterns = [

    path('', views.overview, name ='overview'),
    path('new/', views.new, name='new-analysis'),
    path('<int:process_id>/report/', views.report, name='report'),
    path('<int:process_id>/order/', views.order, name='order'),

]