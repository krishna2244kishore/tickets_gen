from django.urls import path, include
from .views import UserList, UserCreate, PasswordResetView, TicketListCreateView, TicketDetailView, UserProfileUpdate, UserLogHistoryViewSet, UserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'userloghistory', UserLogHistoryViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('users/', UserList.as_view(), name='user-list'),
    path('register/', UserCreate.as_view(), name='user-register'),
    path('profile/', UserProfileUpdate.as_view(), name='user-profile-update'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('', include(router.urls)),
] 