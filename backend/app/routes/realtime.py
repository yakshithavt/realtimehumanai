from fastapi import APIRouter

router = APIRouter(prefix="/realtime", tags=["Realtime"])


@router.get("/test")
def test_realtime():
    return {"message": "Realtime route working"}
