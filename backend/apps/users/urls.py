from django.urls import path
from .views import LoginView, MeView, RegisterView, UpdateUserRoleView, UserDetailView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:pk>/role/', UpdateUserRoleView.as_view(), name='update-role'),
]
