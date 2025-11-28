from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import enum


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer)
    citizen_name = Column(String)

    department = Column(String)
    purpose = Column(String)
    appointment_date = Column(DateTime)

    token_number = Column(Integer, nullable=True)

    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
