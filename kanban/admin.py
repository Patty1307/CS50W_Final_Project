from django.contrib import admin

from .models import User, Board, Column

class BoardAdmin(admin.ModelAdmin):
    list_display =("id", "name", "owner","created")

class ColumnAdmin(admin.ModelAdmin):
    list_display = ("id","board","name","position")
    ordering = ("board","position")


# Register your models here.
admin.site.register(User)
admin.site.register(Board, BoardAdmin)
admin.site.register(Column, ColumnAdmin)