from fastapi import APIRouter

router = APIRouter(prefix="/tts", tags=["TTS"])


@router.get("/test")
def test_tts():
    return {"message": "TTS route working"}
