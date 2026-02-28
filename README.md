# Kanban Boards – A Dynamic Multi-Board Kanban Application

Kanban Boards is a fully dynamic Kanban web application built with Django and JavaScript. 
It allows authenticated users to create and manage multiple Kanban boards, each with customizable columns and draggable task cards.

Unlike a static task tracker, this application supports dynamically generated board structures, column management, drag-and-drop reordering, and modal-based task editing — all scoped to individual users through authentication and data isolation.

## Distinctiveness and Complexity

This project is distinct from the other course projects because it is neither a social network nor an e-commerce platform.

Unlike Project 4, there are no shared feeds, user interactions, or social relationships between users. All data is strictly isolated per authenticated user. Users do not interact with each other, and no shared content system exists.

It also differs fundamentally from Project 2. The application does not revolve around listings, transactions, or marketplace logic. Instead, it focuses on hierarchical structural management of dynamic objects:

User → Boards → Columns → Cards

The primary complexity of this project lies in its dynamic and persistent architecture.

Each board can contain a flexible number of user-defined columns. Columns can be created, renamed, and deleted dynamically. Within each column, cards can be created, edited, deleted, and reordered.

A significant technical challenge was implementing persistent drag-and-drop functionality. Each card contains a `position` field stored in the database. Whenever a card is moved:

- The frontend calculates the updated ordering of cards.
- The new order is sent to the backend via a JSON API request.
- The backend updates the corresponding `position` values in the database.
- If the card changes columns, the foreign key relationship is updated accordingly.

This ensures that card ordering remains consistent across page reloads and sessions.

After login, the application behaves similarly to a single-page application (SPA). The initial page is rendered by Django, but boards, columns, and cards are dynamically loaded and updated using JavaScript and JSON API responses without requiring full page reloads.

The combination of dynamic column structures, persistent ordering logic, API-based frontend-backend synchronization, and user-based data isolation adds substantial architectural complexity beyond basic CRUD functionality.

## Features

- User authentication (login/logout) with strict data isolation: each user can only access their own boards, columns, and cards.
- Multi-board support: users can create and delete multiple Kanban boards from a modern collapsible sidebar navigation.
- Automatic board template: new boards are initialized with default columns (To Do, Doing, Done).
- Fully dynamic columns per board:
  - Create new columns
  - Rename columns
  - Delete columns
- Cards (tasks) inside columns:
  - Create and delete cards
  - Edit card title and add a longer description via a modal dialog
- Drag-and-drop card movement:
  - Move cards within a column and between columns
  - Persist ordering using a `position` field in the database
  - Frontend sends updated ordering to the backend via API calls (JSON)
- Mobile-responsive layout (works on desktop and mobile)

## File Structure

- manage.py  
  Entry point for running the Django development server and managing the project.

- project/settings.py  
  Contains Django configuration such as installed apps, middleware, authentication setup, database configuration, and static file handling.

- kanban/models.py  
  Defines the database structure:
  - Board model (linked to Django User)
  - Column model (linked to Board)
  - Card model (linked to Column) including a `position` field to persist card ordering within a column.

- kanban/views.py  
  Contains both template-rendering views and JSON API endpoints.  
  Responsibilities include:
  - Rendering login, registration, and the main index page
  - Creating and deleting boards
  - Creating, renaming, and deleting columns
  - Creating, editing, deleting, and moving cards
  - Persisting drag-and-drop ordering updates via JSON requests

- kanban/urls.py  
  Defines all routes including:
  - Authentication routes
  - Main application route
  - API endpoints used by JavaScript to dynamically update boards, columns, and cards
  - API endpoints used by JavaScript to load the views

- kanban/admin.py  
  Customizes the Django admin interface to allow management of boards, columns, and cards.  
  Improves visibility of relationships between boards and their columns in the admin panel.

- templates/login.html  
  Login interface using Django’s authentication system.

- templates/register.html  
  User registration page.

- templates/layout.html  
  Base layout template containing the collapsible sidebar navigation and shared structure across the application.

- templates/index.html  
  Main application entry after login.  
  After authentication, the application behaves like a single-page application (SPA).  
  Board content is dynamically loaded and updated via JavaScript and API calls without full page reloads.

- static/kanban/menu.js  
  Handles sidebar logic:
  - Board creation
  - Sidebar toggle/minimization
  - Dynamic loading of selected boards

- static/kanban/menu.css  
  - Styling for the sidebar navigation and overall layout structure.
  - responsive behavior for the menu

- static/kanban/board.js  
  Handles Kanban board functionality:
  - Dynamic rendering of columns and cards
  - Drag-and-drop functionality
  - Fetch API calls with JSON responses
  - Persisting card order changes
  - Modal logic for editing card titles and descriptions

- static/kanban/board.css  
  Contains styling for the Kanban layout, responsive behavior, column structure, and card design.

## How to Run

1. Clone the repository and navigate into the project directory.

2. (Recommended) Create and activate a virtual environment.

3. Ensure Python 3 is installed on your virtual environment.

4. Install Django 5.2.3 on your virtual environment:

   pip install Django==5.2.3

5. Apply database migrations:

   python manage.py migrate

6. Start the development server:

   python manage.py runserver

7. Open the application in your browser:
   http://127.0.0.1:8000/

(Optional) Create a superuser for admin access:

   python manage.py createsuperuser



