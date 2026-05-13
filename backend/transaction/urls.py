from django.urls import path
from transaction import views

urlpatterns = [
    # /api/transaction/                        → list all transactions for current user
    path('', views.transaction_list, name='transaction-list'),
    # /api/transaction/<id>/                   → get a single transaction
    path('<int:pk>/', views.transaction_detail, name='transaction-detail'),
    # /api/transaction/campaign/<campaign_id>/ → all transactions for a campaign
    path('campaign/<int:campaign_pk>/', views.campaign_transactions, name='campaign-transactions'),
]