from fastapi import APIRouter, HTTPException
from ...models.request_models import ScreenFrameRequest
from ...models.response_models import ScreenFrameResponse
from ...services.screen_service import analyze_screen_frame

router = APIRouter(prefix="/screen", tags=["Screen Share"])


@router.post("/frame", response_model=ScreenFrameResponse)
async def analyze_frame_endpoint(request: ScreenFrameRequest):
    """
    Analyze a screen capture frame.
    
    - **frame**: Base64 encoded image of the screen
    - **language**: Language for the AI response
    """
    try:
        # Validate base64 (basic check)
        if len(request.frame) < 100:
            raise HTTPException(
                status_code=400,
                detail="Invalid frame data. Must be base64 encoded image.",
            )
        
        response_text = await analyze_screen_frame(
            frame_base64=request.frame,
            language=request.language,
        )
        
        return ScreenFrameResponse(
            success=True,
            response=response_text,
            language=request.language,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing screen: {str(e)}",
        )
