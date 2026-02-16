import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST, require_GET, require_http_methods


from .models import User, Board

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
    
    # Try to create board
    board, created = Board.objects.get_or_create(
        owner=request.user,
        name=board_name
    )

    # Give id back an if the board is really created
    return JsonResponse({
        "board_id": board.id,
        "created": created,
    }, status=200)


def board(request, id):
    pass