from fastapi import APIRouter, UploadFile, File, Form
from app.services.vision_service import analyze_screen


router = APIRouter(prefix="/screen", tags=["Screen"])

@router.post("/analyze")
async def screen_analyze(
    image: UploadFile = File(...),
    lang: str = Form("English")
):
    image_bytes = await image.read()
    reply = analyze_screen(image_bytes, user_lang=lang)

    return {
        "success": True,
        "instruction": reply
    }
