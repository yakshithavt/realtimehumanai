from fastapi import APIRouter, HTTPException, Query
from ...models.request_models import AvatarRequest
from ...models.response_models import AvatarResponse
from ...services.heygen_service import generate_avatar_video, get_video_status

router = APIRouter(prefix="/heygen", tags=["HeyGen Avatar"])


@router.post("/avatar", response_model=AvatarResponse)
async def generate_avatar_endpoint(request: AvatarRequest):
    """
    Generate a speaking avatar video using HeyGen.
    
    - **text**: Text for the avatar to speak
    - **language**: Language for speech synthesis
    """
    try:
        success, video_url, session_id, status = await generate_avatar_video(
            text=request.text,
            language=request.language,
        )
        
        return AvatarResponse(
            success=success,
            video_url=video_url,
            session_id=session_id,
            status=status,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating avatar: {str(e)}",
        )


@router.get("/status", response_model=AvatarResponse)
async def get_avatar_status(video_id: str = Query(..., description="Video ID to check")):
    """
    Check the status of a video generation request.
    
    - **video_id**: The video ID returned from the generate endpoint
    """
    try:
        status, video_url = await get_video_status(video_id)
        
        return AvatarResponse(
            success=video_url is not None,
            video_url=video_url,
            session_id=video_id,
            status=status,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking status: {str(e)}",
        )
