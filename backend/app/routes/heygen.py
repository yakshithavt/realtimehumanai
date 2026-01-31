from fastapi import APIRouter
import os
import requests

router = APIRouter(prefix="/heygen", tags=["HeyGen"])

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")


@router.get("/test")
def test_heygen():
    return {
        "message": "HeyGen route working",
        "api_key_loaded": bool(HEYGEN_API_KEY)
    }
