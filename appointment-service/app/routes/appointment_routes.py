from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas import AppointmentCreate, AppointmentResponse
from app.models import Appointment, AppointmentStatus
from app.auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Citizen books an appointment
@router.post("/", response_model=AppointmentResponse)
def create_appointment(data: AppointmentCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = Appointment(
        citizen_id=user["id"],
        citizen_name=user["email"],
        department=data.department,
        purpose=data.purpose,
        appointment_date=data.appointment_date,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


# Employee approves + assigns token number
@router.put("/{id}/approve")
def approve_appointment(id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == id).first()

    total_today = db.query(Appointment).filter(
        Appointment.department == appointment.department
    ).count()

    appointment.token_number = total_today + 1
    appointment.status = AppointmentStatus.approved

    db.commit()
    return {"msg": "Approved", "token_number": appointment.token_number}


# Citizen checks their appointment
@router.get("/my", response_model=list[AppointmentResponse])
def get_my_appointments(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.citizen_id == user["id"]).all()
