from .models import Board

def boards(request):
    if request.user.is_authenticated:
        return {
            "menu_boards": Board.objects.filter(owner=request.user).only("id", "name")
        }
    return {"menu_boards": []}
