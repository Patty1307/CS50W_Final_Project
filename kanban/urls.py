from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
    path("board/<int:id>", views.board, name="board"),

 # API Routes
    path("board/create", views.board_create, name="board_create"),
    path("board/<int:board_id>/get", views.get_board, name="get_board"),
]