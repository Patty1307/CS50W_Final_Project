import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST, require_GET, require_http_methods


from .models import User, Board, Column

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


@csrf_protect
@require_GET
@login_required(login_url='login')
def get_board(request, board_id):
    
    board = get_object_or_404(Board, id=board_id)

    return JsonResponse({
    "columns": [
        {
            "id": c.id,
            "name": c.name,
            "position": c.position
        }
        for c in board.columns.all()
    ]
    }, status=200)


@csrf_protect
@require_http_methods(["PUT"])
@login_required
def rename_column(request, column_id):
    
    column = get_object_or_404(Column, id=column_id)

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
