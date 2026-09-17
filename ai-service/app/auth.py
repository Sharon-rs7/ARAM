from fastapi import Header, HTTPException
from app.config import settings

def verify_internal_token(x_internal_token: str = Header(None)):
    if not x_internal_token or x_internal_token != settings.INTERNAL_API_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing or invalid internal communication token."
        )
