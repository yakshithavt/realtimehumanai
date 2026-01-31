from pydantic import BaseModel
from typing import Optional


class VisionResponse(BaseModel):
    """Response model for vision analysis."""
    success: bool
    response: str
    language: str


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    success: bool
    response: str
    language: str


class AvatarResponse(BaseModel):
    """Response model for avatar generation."""
    success: bool
    video_url: Optional[str] = None
    session_id: Optional[str] = None
    status: str


class ScreenFrameResponse(BaseModel):
    """Response model for screen frame analysis."""
    success: bool
    response: str
    language: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    message: str
