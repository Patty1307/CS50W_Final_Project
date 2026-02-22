from django.contrib import admin
from .models import User, Board, Column, Card


# USER
admin.site.register(User)


# BOARD
@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "created")
    search_fields = ("name", "owner__username", "owner__email")
    list_filter = ("owner", "created")
    ordering = ("-created",)


# COLUMN
@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ("id", "board", "name", "position", "created")
    list_filter = ("board",)
    search_fields = ("name", "board__name", "board__owner__username")
    ordering = ("board", "position")
    list_select_related = ("board",)


# CARD
@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("title", "get_board", "column", "position", "updated")
    list_filter = ("column__board", "updated")
    search_fields = (
        "title",
        "description",
        "column__name",
        "column__board__name",
        "column__board__owner__username",
    )
    ordering = ("column__board", "column__position", "position")
    list_select_related = ("column", "column__board")

    @admin.display(description="Board")
    def get_board(self, obj):
        return obj.column.board