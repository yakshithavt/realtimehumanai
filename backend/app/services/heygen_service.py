import httpx
from typing import Tuple, Optional
from ..core.config import settings


# Language code mapping for HeyGen
LANGUAGE_CODES = {
    "English": "en",
    "Tamil": "ta",
    "Hindi": "hi",
    "Telugu": "te",
    "Malayalam": "ml",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Japanese": "ja",
    "Chinese": "zh",
    "Arabic": "ar",
    "Portuguese": "pt",
    "Korean": "ko",
    "Russian": "ru",
}


async def generate_avatar_video(text: str, language: str) -> Tuple[bool, Optional[str], Optional[str], str]:
    """
    Generate a speaking avatar video using HeyGen API.
    
    Args:
        text: Text for the avatar to speak
        language: Language for speech
        
    Returns:
        Tuple of (success, video_url, session_id, status_message)
    """
    if not settings.heygen_api_key:
        return False, None, None, "HeyGen API key not configured"
    
    if not settings.default_avatar_id:
        return False, None, None, "Default avatar ID not configured"
    
    # Get language code
    lang_code = LANGUAGE_CODES.get(language, "en")
    
    try:
        async with httpx.AsyncClient() as client:
            # Create video generation request
            response = await client.post(
                f"{settings.heygen_api_url}/video/generate",
                headers={
                    "X-Api-Key": settings.heygen_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "video_inputs": [
                        {
                            "character": {
                                "type": "avatar",
                                "avatar_id": settings.default_avatar_id,
                                "avatar_style": "normal",
                            },
                            "voice": {
                                "type": "text",
                                "input_text": text,
                                "voice_id": f"auto_{lang_code}",  # Auto-select voice for language
                            },
                        }
                    ],
                    "dimension": {
                        "width": 512,
                        "height": 512,
                    },
                },
                timeout=30.0,
            )
            
            if response.status_code == 200:
                data = response.json()
                video_id = data.get("data", {}).get("video_id")
                
                if video_id:
                    # Poll for video completion (simplified - in production use webhooks)
                    return True, None, video_id, "Video generation started. Check status with video_id."
                    
            elif response.status_code == 401:
                return False, None, None, "Invalid HeyGen API key"
            elif response.status_code == 429:
                return False, None, None, "HeyGen rate limit exceeded"
            else:
                return False, None, None, f"HeyGen API error: {response.status_code}"
                
    except httpx.TimeoutException:
        return False, None, None, "HeyGen API timeout"
    except Exception as e:
        return False, None, None, f"Error: {str(e)}"
    
    return False, None, None, "Unknown error"


async def get_video_status(video_id: str) -> Tuple[str, Optional[str]]:
    """
    Check the status of a video generation request.
    
    Args:
        video_id: The video ID from generate request
        
    Returns:
        Tuple of (status, video_url)
    """
    if not settings.heygen_api_key:
        return "error", None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.heygen_api_url}/video_status.get",
                headers={
                    "X-Api-Key": settings.heygen_api_key,
                },
                params={"video_id": video_id},
                timeout=10.0,
            )
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("data", {}).get("status", "unknown")
                video_url = data.get("data", {}).get("video_url")
                return status, video_url
                
    except Exception as e:
        return f"error: {str(e)}", None
    
    return "unknown", None
