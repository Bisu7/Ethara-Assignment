from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import os
from typing import List

from database import engine, get_db, Base
import models
import schemas
import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Manager API")

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Project Manager API is running"}

# AUTH & USERS

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.get("/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Everyone can see users to assign tasks
    users = db.query(models.User).all()
    return users


#PROJECTS 

@app.get("/projects", response_model=List[schemas.ProjectOut])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Project).all()

@app.post("/projects", response_model=schemas.ProjectOut)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    new_project = models.Project(**project.model_dump(), owner_id=current_user.id)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/projects/{project_id}", response_model=schemas.ProjectDetailOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


# TASKS 

@app.get("/projects/{project_id}/tasks", response_model=List[schemas.TaskOut])
def get_tasks_for_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    return tasks

@app.post("/projects/{project_id}/tasks", response_model=schemas.TaskOut)
def create_task(project_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_task = models.Task(**task.model_dump(), project_id=project_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions: Admin can update anything, Member can only update status of their own tasks or if unassigned
    if current_user.role != models.RoleEnum.Admin:
        if task.assignee_id != current_user.id and task_update.status is not None:
            pass # We could restrict, but usually members can pick up tasks. Let's say members can only update status.
        
        # Prevent members from changing anything other than status
        update_data = task_update.model_dump(exclude_unset=True)
        allowed_member_updates = {"status"}
        if any(key not in allowed_member_updates for key in update_data.keys()):
            raise HTTPException(status_code=403, detail="Members can only update task status")
            
    for key, value in task_update.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_admin)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


# DASHBOARD

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    total_projects = db.query(models.Project).count()
    
    # For members, maybe only show stats for their tasks or projects they are part of? 
    # Let's keep it simple: global stats for everyone for now.
    
    total_tasks = db.query(models.Task).count()
    
    status_counts = {
        models.StatusEnum.Todo: db.query(models.Task).filter(models.Task.status == models.StatusEnum.Todo).count(),
        models.StatusEnum.InProgress: db.query(models.Task).filter(models.Task.status == models.StatusEnum.InProgress).count(),
        models.StatusEnum.Review: db.query(models.Task).filter(models.Task.status == models.StatusEnum.Review).count(),
        models.StatusEnum.Done: db.query(models.Task).filter(models.Task.status == models.StatusEnum.Done).count(),
    }
    
    now = datetime.utcnow()
    overdue_tasks = db.query(models.Task).filter(
        models.Task.due_date < now,
        models.Task.status != models.StatusEnum.Done
    ).count()
    
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "tasks_by_status": status_counts,
        "overdue_tasks": overdue_tasks
    }
