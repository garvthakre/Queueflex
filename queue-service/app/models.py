from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String)
    token_number = Column(Integer)
    citizen_id = Column(Integer)
    status = Column(String, default="waiting")  # waiting / serving / done
    created_at = Column(DateTime(timezone=True), server_default=func.now())
