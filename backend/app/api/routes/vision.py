from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ...models.response_models import VisionResponse
from ...services.vision_service import analyze_image

router = APIRouter(prefix="/vision", tags=["Vision"])


@router.post("/analyze", response_model=VisionResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(..., description="Image file to analyze"),
    language: str = Form(default="English", description="Response language"),
):
    """
    Analyze an uploaded image and provide explanation.
    
    - **file**: Image file (PNG, JPG, GIF, WebP)
    - **language**: Language for the AI response
    """
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )
    
    # Validate file size (max 20MB)
    max_size = 20 * 1024 * 1024  # 20MB
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 20MB.",
        )
    
    try:
        response_text = await analyze_image(
            image_bytes=contents,
            language=language,
            filename=file.filename or "image.jpg",
        )
        
        return VisionResponse(
            success=True,
            response=response_text,
            language=language,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing image: {str(e)}",
        )
