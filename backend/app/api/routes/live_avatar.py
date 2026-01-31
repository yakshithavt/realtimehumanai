from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ...services.heygen_live_service import heygen_live_service


router = APIRouter(prefix="/live-avatar", tags=["Live Avatar"])


class CreateSessionRequest(BaseModel):
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    language: str = "en"


class CreateSessionResponse(BaseModel):
    success: bool
    session_id: Optional[str] = None
    session_token: Optional[str] = None
    message: str


class StartSessionRequest(BaseModel):
    session_token: str


class StartSessionResponse(BaseModel):
    success: bool
    livekit_url: Optional[str] = None
    livekit_token: Optional[str] = None
    message: str


class SpeakTextRequest(BaseModel):
    session_id: str
    text: str


class SpeakTextResponse(BaseModel):
    success: bool
    message: str


class SessionInfoResponse(BaseModel):
    success: bool
    session_data: Optional[dict] = None
    message: str


@router.post("/create-session", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """
    Create a new LiveAvatar session token.
    
    - **avatar_id**: Optional avatar ID (uses default if not provided)
    - **voice_id**: Optional voice ID (uses default if not provided)
    - **language**: Language for the session (default: "en")
    """
    try:
        success, session_id, session_token, message = await heygen_live_service.create_session_token(
            avatar_id=request.avatar_id,
            voice_id=request.voice_id,
            language=request.language
        )
        
        return CreateSessionResponse(
            success=success,
            session_id=session_id,
            session_token=session_token,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating session: {str(e)}"
        )


@router.post("/start-session", response_model=StartSessionResponse)
async def start_session(request: StartSessionRequest):
    """
    Start a LiveAvatar session using the session token.
    
    - **session_token**: Session token from create-session endpoint
    """
    try:
        success, session_data, message = await heygen_live_service.start_session(
            session_token=request.session_token
        )
        
        return StartSessionResponse(
            success=success,
            livekit_url=session_data.get("livekit_url") if session_data else None,
            livekit_token=session_data.get("livekit_token") if session_data else None,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error starting session: {str(e)}"
        )


@router.post("/speak-text", response_model=SpeakTextResponse)
async def speak_text(request: SpeakTextRequest):
    """
    Send text for the avatar to speak (handled via LiveKit WebSocket).
    
    - **session_id**: Session ID
    - **text**: Text for the avatar to speak
    """
    try:
        success, message = await heygen_live_service.send_text(
            session_id=request.session_id,
            text=request.text
        )
        
        return SpeakTextResponse(
            success=success,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending text: {str(e)}"
        )


@router.get("/session-info/{session_id}", response_model=SessionInfoResponse)
async def get_session_info(session_id: str):
    """
    Get information about a LiveAvatar session.
    
    - **session_id**: Session ID to check
    """
    try:
        success, session_data, message = await heygen_live_service.get_session_info(session_id)
        
        return SessionInfoResponse(
            success=success,
            session_data=session_data,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting session info: {str(e)}"
        )
