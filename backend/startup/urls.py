from django.urls import path

from . import views

urlpatterns = [
    # /api/startup/        → list all or create new
    path('', views.startup_list, name='startup-list'),
    # /api/startup/<id>/   → get, update or delete one
    path('<int:pk>/', views.startup_detail, name='startup-detail'),
]