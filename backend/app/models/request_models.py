from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=10000, description="User message")
    language: str = Field(default="English", description="Response language")
    context: Optional[str] = Field(default=None, description="Previous context for continuity")


class AvatarRequest(BaseModel):
    """Request model for avatar generation."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text for avatar to speak")
    language: str = Field(default="English", description="Language for speech")


class ScreenFrameRequest(BaseModel):
    """Request model for screen frame analysis."""
    frame: str = Field(..., description="Base64 encoded image frame")
    language: str = Field(default="English", description="Response language")


class FileAnalysisRequest(BaseModel):
    """Request model for file analysis."""
    file: str = Field(..., description="Base64 encoded file content")
    fileName: str = Field(..., description="Original filename")
    fileType: str = Field(..., description="MIME type of the file")
    language: str = Field(default="English", description="Response language")
