from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, StatusEnum

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.Member

class UserOut(UserBase):
    id: int
    role: RoleEnum

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[StatusEnum] = StatusEnum.Todo
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    project_id: int
    assignee_id: Optional[int]
    created_at: datetime
    assignee: Optional[UserOut] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    owner: UserOut

    class Config:
        from_attributes = True

class ProjectDetailOut(ProjectOut):
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_projects: int
    total_tasks: int
    tasks_by_status: dict
    overdue_tasks: int
