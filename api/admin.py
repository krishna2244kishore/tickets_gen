from django.contrib import admin
from .models import UserProfile, Ticket, UserLogHistory

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Ticket)
admin.site.register(UserLogHistory)
