from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
 
queues = {
    "main": {
        "last_token": 0,
        "tokens": []
    }
}

class BookToken(BaseModel):
    name: str
    phone: str
    queueId: str

@router.post("/book")
def book_token(data: BookToken):
    q = queues[data.queueId]
    q["last_token"] += 1

    token_number = q["last_token"]

    q["tokens"].append({
        "tokenNumber": token_number,
        "name": data.name,
        "phone": data.phone,
        "status": "waiting"
    })

    return {"tokenNumber": token_number}


@router.get("/queue/{queue_id}")
def get_queue(queue_id: str):
    if queue_id not in queues:
        return {"error": "queue not found"}
    return queues[queue_id]["tokens"]
