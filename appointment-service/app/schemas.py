from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AppointmentCreate(BaseModel):
    department: str
    purpose: str
    appointment_date: datetime


class AppointmentResponse(BaseModel):
    id: int
    citizen_id: int
    citizen_name: str
    department: str
    purpose: str
    appointment_date: datetime
    token_number: Optional[int]
    status: str

    class Config:
        orm_mode = True
