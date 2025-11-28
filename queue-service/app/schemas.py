from pydantic import BaseModel

class QueueEntry(BaseModel):
    department: str
    token_number: int
    citizen_id: int

class QueueStatusResponse(BaseModel):
    current_token: int | None
    next_token: int | None
    queue_length: int
