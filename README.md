# Ethara Assignment

A comprehensive project management web application built with a modern React frontend and a fast, robust FastAPI backend. It includes authentication, project creation, kanban task boards, and a dashboard overview.

## Features

- **Authentication**: JWT-based login and signup.
- **Role-based Access**: 'Admin' and 'Member' roles. Admins can create projects and assign tasks. Members can update the status of tasks.
- **Dashboard**: High-level overview of projects, tasks, and overdue statuses.
- **Project Management**: Create and manage multiple projects.
- **Task Kanban Board**: Track tasks through 'Todo', 'In Progress', 'Review', and 'Done' columns.
- **Unique Design**: Custom-built minimalist UI (without typical AI-generated glossy Tailwind classes) for a clean, professional, human-crafted feel.

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios, Lucide Icons, Vanilla CSS
- **Backend**: FastAPI (Python), SQLAlchemy, Passlib, PyJWT
- **Database**: PostgreSQL (or SQLite for local dev if Postgres isn't configured)

## Local Development Setup

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Setup Database (PostgreSQL via Docker):
   Ensure you have Docker Desktop installed and running.
   ```bash
   # From the backend directory
   docker-compose up -d
   ```
   *This will start a PostgreSQL instance on port 5440.*

5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be running at `http://localhost:8000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:5173`*


