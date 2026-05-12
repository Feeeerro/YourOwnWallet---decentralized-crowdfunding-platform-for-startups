from django.urls import path
from users import views

# Maps URLs to view functions
# Full path example: /api/users/register/ → register view
urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.me, name='me'),
]