from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str
    name: str
    role: str  # Admin, COO, CTO, Project Manager, Tech, Design, AI, Cloud, Research, Content, Intern
    email: Optional[str] = None
    contact: Optional[str] = None
    skillset: Optional[List[str]] = []
    current_tasks: Optional[List[str]] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    name: str
    role: str
    email: Optional[str] = None
    contact: Optional[str] = None
    skillset: Optional[List[str]] = []
    current_tasks: Optional[List[str]] = []
    created_at: str

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: str
    email: Optional[str] = None
    contact: Optional[str] = None
    skillset: Optional[List[str]] = []

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    skillset: Optional[List[str]] = None
    current_tasks: Optional[List[str]] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    type: str  # AI tools, SaaS apps, academy content
    assigned_members: List[str] = []
    deadline: Optional[str] = None
    status: str = "todo"  # todo, doing, done
    progress: int = 0
    files: Optional[List[str]] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    assigned_members: List[str] = []
    deadline: Optional[str] = None

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    title: str
    description: Optional[str] = None
    assigned_to: str
    status: str = "todo"
    priority: str = "medium"  # low, medium, high
    due_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    assigned_to: str
    priority: str = "medium"
    due_date: Optional[str] = None

class CalendarEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    event_type: str  # startup, content, academy, personal
    attendees: List[str] = []
    google_event_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    event_type: str
    attendees: List[str] = []

class LeaveRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    start_date: str
    end_date: str
    reason: str
    status: str = "pending"  # pending, approved, rejected
    delegate_to: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LeaveRequestCreate(BaseModel):
    user_id: str
    user_name: str
    start_date: str
    end_date: str
    reason: str
    delegate_to: Optional[str] = None

class ContentItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    platform: str  # YT, Insta, LinkedIn
    content_type: str  # video, post, article
    assigned_editor: Optional[str] = None
    scheduled_date: Optional[str] = None
    status: str = "draft"  # draft, review, scheduled, published
    draft_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContentItemCreate(BaseModel):
    title: str
    platform: str
    content_type: str
    assigned_editor: Optional[str] = None
    scheduled_date: Optional[str] = None

class AIProject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    dataset: Optional[str] = None
    model_version: Optional[str] = None
    accuracy: Optional[float] = None
    status: str = "development"  # development, testing, deployed
    assigned_engineers: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AIProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataset: Optional[str] = None
    assigned_engineers: List[str] = []

class ResearchNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    tags: List[str] = []
    author: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ResearchNoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    author: str

class AcademyCourse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None
    students_count: int = 0
    status: str = "draft"  # draft, active, completed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AcademyCourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None

class PersonalTask(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    category: str  # college, startup, personal
    status: str = "todo"
    due_date: Optional[str] = None
    is_private: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PersonalTaskCreate(BaseModel):
    user_id: str
    title: str
    category: str
    due_date: Optional[str] = None
    is_private: bool = True

class CloudService(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    status: str  # online, offline, maintenance
    uptime: Optional[str] = None
    environment: str  # prod, staging, dev
    last_deployment: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CloudServiceCreate(BaseModel):
    name: str
    environment: str


# Finance Models
class FinanceTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # income, expense, salary
    category: str  # software, marketing, content, operational, salary, revenue
    amount: float
    description: str
    date: str
    payment_method: Optional[str] = None
    receipt_url: Optional[str] = None
    paid_to: Optional[str] = None  # For salary payments
    status: str = "completed"  # pending, completed
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FinanceTransactionCreate(BaseModel):
    type: str
    category: str
    amount: float
    description: str
    date: str
    payment_method: Optional[str] = None
    receipt_url: Optional[str] = None
    paid_to: Optional[str] = None
    status: str = "completed"
    created_by: str

class SalaryRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    month: str  # YYYY-MM format
    base_salary: float
    deductions: float = 0.0
    bonuses: float = 0.0
    net_salary: float
    status: str = "pending"  # pending, paid
    payment_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SalaryRecordCreate(BaseModel):
    user_id: str
    user_name: str
    month: str
    base_salary: float
    deductions: float = 0.0
    bonuses: float = 0.0

# Attendance Models
class AttendanceRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    total_hours: Optional[float] = None
    status: str = "present"  # present, absent, leave, half_day
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AttendanceCheckIn(BaseModel):
    user_id: str
    user_name: str

class AttendanceCheckOut(BaseModel):
    user_id: str
    date: str


# Kudos System Models
class KudosTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    amount: int  # Can be positive or negative
    reason: str
    category: str  # task_completion, meeting_attendance, training_completion, manual
    given_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class KudosTransactionCreate(BaseModel):
    user_id: str
    user_name: str
    amount: int
    reason: str
    category: str
    given_by: str

# Training Section Models
class TrainingCourse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None
    video_url: Optional[str] = None
    files: List[str] = []  # URLs to uploaded files
    homework_tasks: List[str] = []
    kudos_reward: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TrainingCourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None
    video_url: Optional[str] = None
    homework_tasks: List[str] = []
    kudos_reward: int = 0

class TrainingProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    user_id: str
    user_name: str
    progress: int = 0  # Percentage
    completed: bool = False
    homework_submitted: bool = False
    homework_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TrainingProgressUpdate(BaseModel):
    progress: int
    homework_submitted: Optional[bool] = None
    homework_url: Optional[str] = None

# Meeting Models
class Meeting(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    agenda: str
    start_time: str
    end_time: str
    organizer: str
    attendees: List[str] = []
    meeting_type: str = "team"  # personal, team
    attendance_tracked: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MeetingCreate(BaseModel):
    title: str
    agenda: str
    start_time: str
    end_time: str
    organizer: str
    attendees: List[str] = []
    meeting_type: str = "team"

class MeetingAttendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    meeting_id: str
    user_id: str
    user_name: str
    status: str  # present, absent
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MeetingAttendanceCreate(BaseModel):
    meeting_id: str
    attendees_present: List[str]  # List of user IDs who attended

# Subscription Models
class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: bool = True
    renewal_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SubscriptionCreate(BaseModel):
    platform: str
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: bool = True
    renewal_date: Optional[str] = None
    notes: Optional[str] = None

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"username": request.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Remove password from response
    user.pop("password")
    return {"user": user, "token": user["id"]}

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if username exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    hashed_password = pwd_context.hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict["password"] = hashed_password
    
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    
    await db.users.insert_one(doc)
    
    # Return without password
    response_dict = {k: v for k, v in doc.items() if k != 'password'}
    return UserResponse(**response_dict)

# ========== USER/TEAM MANAGEMENT ==========

@api_router.get("/users", response_model=List[UserResponse])
async def get_users():
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate):
    update_dict = {k: v for k, v in user_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User updated successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# ========== PROJECT MANAGEMENT ==========

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate):
    project_obj = Project(**project_data.model_dump())
    doc = project_obj.model_dump()
    await db.projects.insert_one(doc)
    return project_obj

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, update_data: dict):
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project updated successfully"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# ========== TASK MANAGEMENT ==========

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if user_id:
        query["assigned_to"] = user_id
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    task_obj = Task(**task_data.model_dump())
    doc = task_obj.model_dump()
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, update_data: dict):
    result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task updated successfully"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ========== CALENDAR MANAGEMENT ==========

@api_router.get("/calendar/events", response_model=List[CalendarEvent])
async def get_calendar_events():
    events = await db.calendar_events.find({}, {"_id": 0}).to_list(1000)
    return events

@api_router.post("/calendar/events", response_model=CalendarEvent)
async def create_calendar_event(event_data: CalendarEventCreate):
    event_obj = CalendarEvent(**event_data.model_dump())
    doc = event_obj.model_dump()
    
    # Sync with Google Calendar
    try:
        google_event_id = await sync_to_google_calendar(event_data)
        doc["google_event_id"] = google_event_id
    except Exception as e:
        logging.error(f"Failed to sync with Google Calendar: {e}")
    
    await db.calendar_events.insert_one(doc)
    return event_obj

@api_router.put("/calendar/events/{event_id}")
async def update_calendar_event(event_id: str, update_data: dict):
    result = await db.calendar_events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated successfully"}

@api_router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str):
    result = await db.calendar_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# ========== LEAVE MANAGEMENT ==========

@api_router.get("/leave-requests", response_model=List[LeaveRequest])
async def get_leave_requests():
    requests = await db.leave_requests.find({}, {"_id": 0}).to_list(1000)
    return requests

@api_router.post("/leave-requests", response_model=LeaveRequest)
async def create_leave_request(request_data: LeaveRequestCreate):
    leave_obj = LeaveRequest(**request_data.model_dump())
    doc = leave_obj.model_dump()
    await db.leave_requests.insert_one(doc)
    return leave_obj

@api_router.put("/leave-requests/{request_id}")
async def update_leave_request(request_id: str, status: str):
    result = await db.leave_requests.update_one({"id": request_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"message": "Leave request updated successfully"}

# ========== CONTENT STUDIO ==========

@api_router.get("/content", response_model=List[ContentItem])
async def get_content_items():
    items = await db.content_items.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/content", response_model=ContentItem)
async def create_content_item(item_data: ContentItemCreate):
    content_obj = ContentItem(**item_data.model_dump())
    doc = content_obj.model_dump()
    await db.content_items.insert_one(doc)
    return content_obj

@api_router.put("/content/{item_id}")
async def update_content_item(item_id: str, update_data: dict):
    result = await db.content_items.update_one({"id": item_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content item not found")
    return {"message": "Content item updated successfully"}

# ========== AI DEVELOPMENT LAB ==========

@api_router.get("/ai-projects", response_model=List[AIProject])
async def get_ai_projects():
    projects = await db.ai_projects.find({}, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/ai-projects", response_model=AIProject)
async def create_ai_project(project_data: AIProjectCreate):
    ai_project_obj = AIProject(**project_data.model_dump())
    doc = ai_project_obj.model_dump()
    await db.ai_projects.insert_one(doc)
    return ai_project_obj

@api_router.put("/ai-projects/{project_id}")
async def update_ai_project(project_id: str, update_data: dict):
    result = await db.ai_projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="AI project not found")
    return {"message": "AI project updated successfully"}

# ========== RESEARCH HUB ==========

@api_router.get("/research-notes", response_model=List[ResearchNote])
async def get_research_notes():
    notes = await db.research_notes.find({}, {"_id": 0}).to_list(1000)
    return notes

@api_router.post("/research-notes", response_model=ResearchNote)
async def create_research_note(note_data: ResearchNoteCreate):
    note_obj = ResearchNote(**note_data.model_dump())
    doc = note_obj.model_dump()
    await db.research_notes.insert_one(doc)
    return note_obj

@api_router.delete("/research-notes/{note_id}")
async def delete_research_note(note_id: str):
    result = await db.research_notes.delete_one({"id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research note not found")
    return {"message": "Research note deleted successfully"}

# ========== ACADEMY ZONE ==========

@api_router.get("/academy/courses", response_model=List[AcademyCourse])
async def get_academy_courses():
    courses = await db.academy_courses.find({}, {"_id": 0}).to_list(1000)
    return courses

@api_router.post("/academy/courses", response_model=AcademyCourse)
async def create_academy_course(course_data: AcademyCourseCreate):
    course_obj = AcademyCourse(**course_data.model_dump())
    doc = course_obj.model_dump()
    await db.academy_courses.insert_one(doc)
    return course_obj

@api_router.put("/academy/courses/{course_id}")
async def update_academy_course(course_id: str, update_data: dict):
    result = await db.academy_courses.update_one({"id": course_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course updated successfully"}

# ========== PERSONAL PLANNER ==========

@api_router.get("/personal-tasks", response_model=List[PersonalTask])
async def get_personal_tasks(user_id: str):
    tasks = await db.personal_tasks.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/personal-tasks", response_model=PersonalTask)
async def create_personal_task(task_data: PersonalTaskCreate):
    task_obj = PersonalTask(**task_data.model_dump())
    doc = task_obj.model_dump()
    await db.personal_tasks.insert_one(doc)
    return task_obj

@api_router.put("/personal-tasks/{task_id}")
async def update_personal_task(task_id: str, update_data: dict):
    result = await db.personal_tasks.update_one({"id": task_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Personal task not found")
    return {"message": "Personal task updated successfully"}

@api_router.delete("/personal-tasks/{task_id}")
async def delete_personal_task(task_id: str):
    result = await db.personal_tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Personal task not found")
    return {"message": "Personal task deleted successfully"}

# ========== CLOUD PANEL ==========

@api_router.get("/cloud-services", response_model=List[CloudService])
async def get_cloud_services():
    services = await db.cloud_services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/cloud-services", response_model=CloudService)
async def create_cloud_service(service_data: CloudServiceCreate):
    service_obj = CloudService(**service_data.model_dump())
    doc = service_obj.model_dump()
    await db.cloud_services.insert_one(doc)
    return service_obj

@api_router.put("/cloud-services/{service_id}")
async def update_cloud_service(service_id: str, update_data: dict):
    result = await db.cloud_services.update_one({"id": service_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cloud service not found")
    return {"message": "Cloud service updated successfully"}

# ========== DASHBOARD STATS ==========

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user_id: Optional[str] = None):
    stats = {}
    
    # Total counts
    stats["total_projects"] = await db.projects.count_documents({})
    stats["total_tasks"] = await db.tasks.count_documents({})
    stats["total_members"] = await db.users.count_documents({})
    stats["pending_leaves"] = await db.leave_requests.count_documents({"status": "pending"})
    
    # User-specific stats
    if user_id:
        stats["my_tasks"] = await db.tasks.count_documents({"assigned_to": user_id, "status": {"$ne": "done"}})
        stats["my_tasks_completed"] = await db.tasks.count_documents({"assigned_to": user_id, "status": "done"})
        stats["my_projects"] = await db.projects.count_documents({"assigned_members": user_id})
        
        # Get user's assigned tasks
        my_assigned_tasks = await db.tasks.find(
            {"assigned_to": user_id, "status": {"$ne": "done"}},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        stats["assigned_tasks"] = my_assigned_tasks
    
    # Recent activity
    recent_projects = await db.projects.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_tasks = await db.tasks.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    stats["recent_projects"] = recent_projects
    stats["recent_tasks"] = recent_tasks
    
    return stats


# ========== FINANCE MODULE ==========

@api_router.get("/finance/transactions", response_model=List[FinanceTransaction])
async def get_finance_transactions():
    transactions = await db.finance_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return transactions

@api_router.post("/finance/transactions", response_model=FinanceTransaction)
async def create_finance_transaction(transaction_data: FinanceTransactionCreate):
    transaction_obj = FinanceTransaction(**transaction_data.model_dump())
    doc = transaction_obj.model_dump()
    await db.finance_transactions.insert_one(doc)
    return transaction_obj

@api_router.get("/finance/summary")
async def get_finance_summary():
    # Get all transactions
    transactions = await db.finance_transactions.find({}, {"_id": 0}).to_list(10000)
    
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expenses = sum(t["amount"] for t in transactions if t["type"] == "expense")
    total_salary = sum(t["amount"] for t in transactions if t["type"] == "salary")
    
    # Category breakdown
    categories = {}
    for t in transactions:
        if t["type"] == "expense":
            category = t["category"]
            categories[category] = categories.get(category, 0) + t["amount"]
    
    # Recent transactions
    recent = sorted(transactions, key=lambda x: x["created_at"], reverse=True)[:10]
    
    # Pending salary payments
    pending_salaries = await db.salary_records.count_documents({"status": "pending"})
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_salary": total_salary,
        "net_balance": total_income - total_expenses - total_salary,
        "expense_by_category": categories,
        "recent_transactions": recent,
        "pending_salary_payments": pending_salaries
    }

@api_router.delete("/finance/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    result = await db.finance_transactions.delete_one({"id": transaction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

# Salary Management
@api_router.get("/finance/salaries", response_model=List[SalaryRecord])
async def get_salary_records():
    salaries = await db.salary_records.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return salaries

@api_router.post("/finance/salaries", response_model=SalaryRecord)
async def create_salary_record(salary_data: SalaryRecordCreate):
    # Calculate net salary
    net_salary = salary_data.base_salary - salary_data.deductions + salary_data.bonuses
    
    salary_dict = salary_data.model_dump()
    salary_dict["net_salary"] = net_salary
    
    salary_obj = SalaryRecord(**salary_dict)
    doc = salary_obj.model_dump()
    await db.salary_records.insert_one(doc)
    return salary_obj

@api_router.put("/finance/salaries/{salary_id}")
async def update_salary_status(salary_id: str, status: str, payment_date: Optional[str] = None):
    update_data = {"status": status}
    if payment_date:
        update_data["payment_date"] = payment_date
    
    result = await db.salary_records.update_one({"id": salary_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return {"message": "Salary status updated successfully"}

# ========== ATTENDANCE MODULE ==========

@api_router.post("/attendance/check-in")
async def check_in(data: AttendanceCheckIn):
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Check if already checked in today
    existing = await db.attendance.find_one({"user_id": data.user_id, "date": today})
    if existing and existing.get("check_in"):
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    check_in_time = datetime.now(timezone.utc).isoformat()
    
    if existing:
        # Update existing record
        await db.attendance.update_one(
            {"user_id": data.user_id, "date": today},
            {"$set": {"check_in": check_in_time}}
        )
    else:
        # Create new record
        attendance_obj = AttendanceRecord(
            user_id=data.user_id,
            user_name=data.user_name,
            date=today,
            check_in=check_in_time,
            status="present"
        )
        doc = attendance_obj.model_dump()
        await db.attendance.insert_one(doc)
    
    return {"message": "Checked in successfully", "time": check_in_time}

@api_router.post("/attendance/check-out")
async def check_out(data: AttendanceCheckOut):
    record = await db.attendance.find_one({"user_id": data.user_id, "date": data.date})
    if not record:
        raise HTTPException(status_code=404, detail="No check-in record found for today")
    
    if record.get("check_out"):
        raise HTTPException(status_code=400, detail="Already checked out")
    
    check_out_time = datetime.now(timezone.utc).isoformat()
    
    # Calculate total hours
    check_in_dt = datetime.fromisoformat(record["check_in"])
    check_out_dt = datetime.fromisoformat(check_out_time)
    total_hours = (check_out_dt - check_in_dt).total_seconds() / 3600
    
    await db.attendance.update_one(
        {"user_id": data.user_id, "date": data.date},
        {"$set": {"check_out": check_out_time, "total_hours": round(total_hours, 2)}}
    )
    
    return {"message": "Checked out successfully", "time": check_out_time, "total_hours": round(total_hours, 2)}

@api_router.get("/attendance/records")
async def get_attendance_records(user_id: Optional[str] = None, month: Optional[str] = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if month:
        # Filter by month (YYYY-MM format)
        query["date"] = {"$regex": f"^{month}"}
    
    records = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return records

@api_router.get("/attendance/summary")
async def get_attendance_summary(user_id: Optional[str] = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    records = await db.attendance.find(query, {"_id": 0}).to_list(10000)
    
    total_days = len(records)
    present_days = len([r for r in records if r["status"] == "present"])
    absent_days = len([r for r in records if r["status"] == "absent"])
    leave_days = len([r for r in records if r["status"] == "leave"])
    
    total_hours = sum(r.get("total_hours", 0) for r in records if r.get("total_hours"))
    
    return {
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "leave_days": leave_days,
        "total_hours_worked": round(total_hours, 2),
        "average_hours_per_day": round(total_hours / present_days, 2) if present_days > 0 else 0
    }


# ========== GOOGLE CALENDAR SYNC ==========

async def sync_to_google_calendar(event_data: CalendarEventCreate):
    """Sync event to Google Calendar"""
    try:
        # Get credentials from environment
        google_email = os.environ.get('GOOGLE_CALENDAR_EMAIL')
        google_app_password = os.environ.get('GOOGLE_CALENDAR_PASSWORD')
        
        if not google_email or not google_app_password:
            logging.warning("Google Calendar credentials not configured")
            return None
        
        # For now, we'll use a simplified approach
        # In production, you'd use OAuth2 flow
        # This is a placeholder for the actual Google Calendar API integration
        
        # Note: App passwords work with SMTP but Google Calendar API requires OAuth2
        # You'll need to set up OAuth2 credentials for full integration
        logging.info(f"Would sync event '{event_data.title}' to Google Calendar")
        
        return None
    except Exception as e:
        logging.error(f"Google Calendar sync error: {e}")
        return None

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
