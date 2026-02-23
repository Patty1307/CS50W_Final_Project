from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
    

 # API Routes
    path("board/create", views.board_create, name="board_create"),
    path("board/get/<int:board_id>", views.get_board, name="get_board"),
    path("board/column/rename/<int:column_id>", views.rename_column, name="rename_column"),
    path("board/column/create/<int:board_id>", views.create_column, name="create_column"),
    path("board/column/delete/<int:column_id>", views.delete_column, name="delete_column"),
    path("board/delete/<int:board_id>", views.delete_board, name="delete_board"),
    path("board/create/task/<int:column_id>", views.create_task, name="create_task"),
    path("cards/<int:card_id>/move", views.move_card, name="move_card"),
]