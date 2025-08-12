from pydantic import BaseModel, Field, HttpUrl
from typing import Dict, Optional
from datetime import date,datetime
from enum import Enum
from .models import PyObjectId

class CategoryEnum(str, Enum):
    campus="campus"
    off_campus="off_campus"
    hackathon="hackathon"
    
class StatusEnum(str,Enum):
    applied = "applied"
    test = "test"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"
    
class ApplicationBase(BaseModel):
    company_name: str = Field(...)
    role: str = Field(...)
    category: CategoryEnum = Field(...)
    status: StatusEnum = Field(...)
    date_applied: date = Field(...)
    important_dates: Optional[Dict[str, date]] = None
    links: Optional[Dict[str, HttpUrl]] = None
    notes: Optional[str] = None
    
class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    category: Optional[CategoryEnum] = None
    status: Optional[StatusEnum] = None
    date_applied: Optional[date] = None
    important_dates: Optional[Dict[str, date]] = None
    links: Optional[Dict[str, HttpUrl]] = None
    notes: Optional[str] = None
    notes: Optional[str]
    
class ApplicationInDB(ApplicationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str, datetime: lambda v: v.isoformat()}
        validate_by_name = True