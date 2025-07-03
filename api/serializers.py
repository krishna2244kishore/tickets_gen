from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, UserProfile, UserLogHistory
from django.db import IntegrityError

class UserSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='userprofile.department', read_only=True)
    accessLevel = serializers.CharField(source='userprofile.accessLevel', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'department', 'accessLevel']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'validators': []},
        }

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        try:
            user.save()
            UserProfile.objects.create(user=user)
        except IntegrityError:
            raise serializers.ValidationError({'username': 'A user with that username already exists.'})
        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return value

class TicketSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['user'] 

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'contact', 'department', 'realName', 'accessLevel', 'projectAccessLevel']
        read_only_fields = ['user'] 

class UserLogHistorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = UserLogHistory
        fields = '__all__' 