from django.contrib import admin

from .models import User, Board

# Register your models here.
admin.site.register(User)
admin.site.register(Board)