from django.urls import path

from . import views

urlpatterns = [
    # /api/campaign/        → list all or create new
    path('', views.campaign_list, name='campaign-list'),
    # /api/campaign/<id>/   → get, update or delete one
    path('<int:pk>/', views.campaign_detail, name='campaign-detail'),
]