from fastapi import FastAPI
from app.routes.appointment_routes import router as appointment_router
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appointment Service")

app.include_router(appointment_router)
