from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer, TicketSerializer, UserProfileSerializer, UserLogHistorySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Ticket, UserProfile, UserLogHistory
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets, permissions

# Create your views here.

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        # Here you would send a reset email in a real app
        return Response({'message': f'If {email} exists, a reset link will be sent.'}, status=status.HTTP_200_OK)

class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # If the user is teamop or teamtech, return all tickets
        if self.request.user.username in ['teamop', 'teamtech']:
            return Ticket.objects.all()
        # Otherwise, only their own tickets
        return Ticket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    queryset = Ticket.objects.all()

    def get_queryset(self):
        if self.request.user.username in ['teamop', 'teamtech']:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)

class UserProfileUpdate(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        try:
            response = super().partial_update(request, *args, **kwargs)
            print('Profile updated successfully:', response.data)
            return response
        except ValidationError as e:
            print('Validation error:', e.detail)
            return Response({'error': e.detail}, status=400)
        except Exception as e:
            print('Unexpected error:', str(e))
            return Response({'error': str(e)}, status=500)

class UserLogHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserLogHistory.objects.all().order_by('-timestamp')
    serializer_class = UserLogHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
