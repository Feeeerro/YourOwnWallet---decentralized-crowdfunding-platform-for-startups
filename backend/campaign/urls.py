from django.urls import path

from . import views

urlpatterns = [
    # /api/campaign/        → list all or create new
    path('', views.campaign_list, name='campaign-list'),
    # /api/campaign/<id>/   → get, update or delete one
    path('<int:pk>/', views.campaign_detail, name='campaign-detail'),
    path('<int:pk>/approve/', views.judge_approve, name='judge-approve'),
    path('<int:pk>/reject/', views.judge_reject, name='judge-reject'),
    path('<int:pk>/fund/', views.fund_campaign, name='fund-campaign'),
]