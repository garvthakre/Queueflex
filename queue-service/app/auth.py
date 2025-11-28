from fastapi import HTTPException, Header
from jose import jwt
import os

SECRET = os.getenv("AUTH_PUBLIC_KEY")

def get_current_user(token: str = Header(None)):
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
