from fastapi import FastAPI
from app.database import Base, engine
from app.routes.queue_routes import router as queue_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Queue Service")

app.include_router(queue_router)
