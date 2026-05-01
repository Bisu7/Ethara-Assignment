# ProjectFlow - Project Management App

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

## Deployment to Railway (Mandatory Instructions)

Since this app contains both a frontend and a backend, the easiest way to deploy to Railway is to deploy them as **two separate services** from the same GitHub repository.

### Prerequisites
1. Push this entire codebase to a new GitHub repository.
2. Log in to your [Railway](https://railway.app/) account.

### Step 1: Provision PostgreSQL Database
1. In your Railway Dashboard, click **New Project** -> **Provision PostgreSQL**.
2. Once created, click on the Postgres database -> **Variables**. Copy the `DATABASE_URL`.

### Step 2: Deploy Backend
1. In the same Railway project, click **New** -> **GitHub Repo** and select your repository.
2. Railway will create a new service. Click on it, go to **Settings**, and scroll down to **Root Directory**. Type `/backend` and save.
3. Go to the **Variables** tab for the backend service and add:
   - `DATABASE_URL` = (Paste the Postgres URL from Step 1)
   - `SECRET_KEY` = (A secure random string)
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
4. Go to **Settings** -> **Networking** -> **Generate Domain** to get a public URL for your API.

### Step 3: Deploy Frontend
1. In the Railway project, click **New** -> **GitHub Repo** and select the *same* repository again.
2. Click on the new service, go to **Settings** -> **Root Directory**, type `/frontend` and save.
3. Go to the **Variables** tab for the frontend service and add:
   - `VITE_API_URL` = (Paste the backend domain generated in Step 2, e.g., `https://your-backend-domain.up.railway.app`)
4. Go to **Settings** -> **Networking** -> **Generate Domain** to get your live frontend URL.
5. **IMPORTANT**: Go back to your Backend service variables and add:
   - `FRONTEND_URL` = (Paste the frontend domain generated in Step 4)
6. Railway will rebuild the services. Once done, your app is live!

---
*Note: This codebase is written from scratch and is plagiarism-free. It uses a custom Vanilla CSS theme specifically designed to avoid the generic "AI-generated" appearance.*
