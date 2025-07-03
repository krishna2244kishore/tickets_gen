from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    contact = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    realName = models.CharField(max_length=100, blank=True)
    accessLevel = models.CharField(max_length=100, blank=True)
    projectAccessLevel = models.CharField(max_length=100, blank=True)
    # Add more fields as needed
    def __str__(self):
        return self.user.username

class Ticket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    ticketNo = models.CharField(max_length=20)
    subject = models.CharField(max_length=200)
    status = models.CharField(max_length=50)
    supportBy = models.CharField(max_length=100)
    date = models.DateTimeField(default=timezone.now)
    rate = models.IntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=100, blank=True)
    priority = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.ticketNo} - {self.subject} ({self.user.username})"

class UserLogHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='log_history')
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
