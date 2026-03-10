from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Program(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    description: str
    image: str
    link: str = "/program"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProgramCreate(BaseModel):
    title: str
    category: str
    description: str
    image: str
    link: Optional[str] = "/program"

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionCreate(BaseModel):
    title: str
    description: str
    image: str

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    videoId: str
    thumbnail: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestimonialCreate(BaseModel):
    videoId: str
    thumbnail: Optional[str] = ""

class Stat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    value: str
    label: str
    order: int = 0

class StatCreate(BaseModel):
    value: str
    label: str
    order: Optional[int] = 0

class Newsletter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)

class NewsletterCreate(BaseModel):
    email: str

class Admin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str
