import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.db.models import Max
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST, require_GET, require_http_methods


from .models import User, Board, Column, Card

DEFAULT_COLUMNS = ["To do", "Doing", "Done"]


@login_required(login_url='login')
def index(request):
    return render(request,"kanban/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "kanban/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "kanban/login.html")

def register_view(request):
    if request.method == "POST":
        # Get the Data from the Form
        username = request.POST["username"]
        email = request.POST["email"]     
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        
        # Ensure there is a password
        if not password or not password.strip():
            return render(request, "kanban/register.html", {
                "message": "You must provide a password"
            })
        
         # Ensure password matches confirmation
        if password != confirmation or not password or not password.strip():
            return render(request, "kanban/register.html", {
                "message": "Passwords must match."
            })

        # Ensure yousername is not null        
        if not username or not username.strip():
            return render(request, "kanban/register.html", {
                "message": "You must provide a username"
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "kanban/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "kanban/register.html")
    
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@csrf_protect
@require_POST
@login_required(login_url='login')
def board_create(request):
    
    # Try to parse the jsnon
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Get the board name
    board_name = data.get("name", "").strip()

    # Handle empty names
    if not board_name:
        return JsonResponse({"error": "Board name empty",
                             "created": False
                             }, status=400)
    
    # Make the Database operation as one pakage
    with transaction.atomic():
        board = Board.objects.create(
            owner=request.user,
            name=board_name
        )

        # 3 Standard-Columns for each new table
        Column.objects.bulk_create([
            Column(board=board, name=name, position=i)
            for i, name in enumerate(DEFAULT_COLUMNS)
        ])

    return JsonResponse({
        "created": True,
        "board": {
            "id": board.id,
            "name": board.name
        }
    }, status=201)



@require_GET
@login_required(login_url='login')
def get_board(request, board_id):
    
    board = get_object_or_404(Board, id=board_id, owner=request.user)

    return JsonResponse({
    "columns": [
        {
            "id": c.id,
            "name": c.name,
            "position": c.position,
                "cards": [card.serialize() for card in c.cards.all()],
            }
        for c in board.columns.all()
    ]
    }, status=200)


@csrf_protect
@require_http_methods(["PUT"])
@login_required
def rename_column(request, column_id):
    
    column = get_object_or_404(Column, id=column_id, board__owner=request.user)

    # Try to parse the jsnon
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Get the new column name
    column_name = data.get("newColumnName", "").strip()

    column.name = column_name
    column.save()

    return JsonResponse({
        "success": True,
    })

@csrf_protect
@require_POST
@login_required
def create_column(request, board_id):
    
    board = get_object_or_404(Board, id=board_id, owner=request.user)

    # Try to parse the jsnon
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Get the new column name
    column_name = (data.get("newColumnName") or "").strip()
    if not column_name:
        return JsonResponse({"error": "Column name is required"}, status=400)

    max_pos = board.columns.aggregate(m=Max("position"))["m"]
    next_pos = 0 if max_pos is None else max_pos + 1

    column = Column.objects.create(
        board=board,
        name=column_name,
        position=next_pos
    )


    return JsonResponse({
        "success": True,
        "id": column.id,
        "name": column.name
    })


@csrf_protect
@require_http_methods(["DELETE"])
@login_required
def delete_column(request, column_id):

    column = get_object_or_404(Column, id=column_id, board__owner=request.user)

    column.delete()

    return JsonResponse({"success": True})

@csrf_protect
@require_http_methods(["DELETE"])
@login_required
def delete_board(request, board_id):
    board = get_object_or_404(Board, id=board_id, owner=request.user)
    board.delete()
    return JsonResponse({"success": True})


@csrf_protect
@require_POST
@login_required
def create_task(request, column_id):
    
    column = get_object_or_404(Column, id=column_id,  board__owner=request.user)

    # Try to parse the jsnon
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Get the task title
    task_title = (data.get("newTaskName") or "").strip()
    if not task_title:
        return JsonResponse({"error": "Task title is required"}, status=400)

    max_pos = column.cards.aggregate(m=Max("position"))["m"]
    next_pos = 0 if max_pos is None else max_pos + 1

    card = Card.objects.create(
        column=column,
        title=task_title,
        position=next_pos
    )

    return JsonResponse({
        "success": True,
        "card": card.serialize()
    }, status=201)


@csrf_protect
@require_http_methods(["PUT"])
@login_required
def move_card(request, card_id):

    # Parse JSON
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate payload
    try:
        from_col_id = int(data["from_column_id"])
        to_col_id = int(data["to_column_id"])
        from_ids = [int(x) for x in data.get("from_ordered_card_ids", None)]
        to_ids = [int(x) for x in data.get("to_ordered_card_ids", None)]
    except (KeyError, TypeError, ValueError):
        return JsonResponse({"error": "Invalid payload"}, status=400)

    # Security: card + columns must belong to current user (through board owner)
    card = get_object_or_404(Card, id=card_id, column__board__owner=request.user)
    from_col = get_object_or_404(Column, id=from_col_id, board__owner=request.user)
    to_col = get_object_or_404(Column, id=to_col_id, board__owner=request.user)

    # Sanity: card must currently be in from_col
    if card.column_id != from_col.id:
        return JsonResponse({"error": "Card is not in from_column"}, status=400)

    # Function to reorder the cards in the database like the are positioned in the front end
    def normalize_positions(column, ordered_ids):
        for idx, cid in enumerate(ordered_ids):
            Card.objects.filter(id=cid, column=column).update(position=idx)

    with transaction.atomic():
        # Move card if necessary
        if from_col.id != to_col.id:
            card.column = to_col
            card.save(update_fields=["column"])

        # If same column reorder, use only to_ids (or from_ids—both should be identical)
        if from_col.id == to_col.id:
            if not to_ids:
                return JsonResponse({"error": "to_ordered_card_ids required for same-column reorder"}, status=400)
            normalize_positions(to_col, to_ids)
        else:
            # Moving between columns: normalize both sides
            if from_col.id != to_col.id:
                if from_ids is None or to_ids is None:
                    return JsonResponse({"error": "from_ordered_card_ids and to_ordered_card_ids are required"}, status=400)

            normalize_positions(from_col, from_ids)
            normalize_positions(to_col, to_ids)

    return JsonResponse({"success": True}, status=200)