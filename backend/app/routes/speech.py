from fastapi import APIRouter

router = APIRouter(prefix="/screen", tags=["Screen"])


@router.get("/test")
def test_screen():
    return {"message": "Screen route working"}
