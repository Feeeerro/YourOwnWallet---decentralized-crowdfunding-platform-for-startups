from django.urls import path
from campaign import views

urlpatterns = [
    path('', views.campaign_list, name='campaign-list'),
    path('<int:pk>/', views.campaign_detail, name='campaign-detail'),
    path('<int:pk>/approve/', views.judge_approve, name='judge-approve'),
    path('<int:pk>/reject/', views.judge_reject, name='judge-reject'),
    path('<int:pk>/fund/', views.fund_campaign, name='fund-campaign'),
    path('<int:pk>/finalize/', views.finalize_campaign, name='finalize-campaign'),
    path('<int:pk>/withdraw/', views.withdraw_funds, name='withdraw-funds'),
    path('<int:pk>/refund/', views.claim_refund, name='claim-refund'),
]