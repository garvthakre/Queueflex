from fastapi import HTTPException, Header
from jose import jwt
import os

SECRET = os.getenv("AUTH_PUBLIC_KEY")


def get_current_user(token: str = Header(None)):
    if token is None:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload  # { id, email, role }
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
