from fastapi import APIRouter, Depends, Response,Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth import get_current_user
from app.models import Queue
from app.schemas import QueueEntry, QueueStatusResponse
from app.sse_manager import sse_manager
import asyncio

router = APIRouter(prefix="/queue", tags=["Queue"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Add citizen to queue (called by Appointment Service after approval)
@router.post("/add")
def add_to_queue(entry: QueueEntry, db: Session = Depends(get_db)):
    new_token = Queue(
        department=entry.department,
        token_number=entry.token_number,
        citizen_id=entry.citizen_id,
        status="waiting"
    )
    db.add(new_token)
    db.commit()

    # push SSE update
    asyncio.create_task(sse_manager.push(f"new_token:{entry.token_number}"))

    return {"msg": "added to queue"}


# Employee calls next token
@router.post("/next/{department}")
def call_next(department: str, db: Session = Depends(get_db)):
    waiting = (
        db.query(Queue)
        .filter(Queue.department == department, Queue.status == "waiting")
        .order_by(Queue.token_number.asc())
        .first()
    )

    if not waiting:
        return {"msg": "no waiting tokens"}

    waiting.status = "serving"
    db.commit()

    # notify via SSE
    asyncio.create_task(sse_manager.push(f"serving:{waiting.token_number}"))

    return {"serving_token": waiting.token_number}


# Citizen checks queue status
@router.get("/status/{department}", response_model=QueueStatusResponse)
def get_status(department: str, db: Session = Depends(get_db)):
    serving = (
        db.query(Queue)
        .filter(Queue.department == department, Queue.status == "serving")
        .first()
    )

    next_token = (
        db.query(Queue)
        .filter(Queue.department == department, Queue.status == "waiting")
        .order_by(Queue.token_number.asc())
        .first()
    )

    queue_length = (
        db.query(Queue)
        .filter(Queue.department == department, Queue.status == "waiting")
        .count()
    )

    return QueueStatusResponse(
        current_token=serving.token_number if serving else None,
        next_token=next_token.token_number if next_token else None,
        queue_length=queue_length
    )


# SSE endpoint (Frontend listens live)
@router.get("/stream")
async def stream(response: Response, request: Request):

    response.headers["Content-Type"] = "text/event-stream"

    queue = await sse_manager.listen()

    while True:
        if await request.is_disconnected():
            break

        data = await queue.get()
        yield f"data: {data}\n\n"
