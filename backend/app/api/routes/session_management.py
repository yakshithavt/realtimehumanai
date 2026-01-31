from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ...services.session_manager import session_manager
from ...services.heygen_live_service import heygen_live_service
from ...services.heygen_session_api import heygen_session_api


router = APIRouter(prefix="/sessions", tags=["Session Management"])


class DeleteSessionRequest(BaseModel):
    session_id: str


class DeleteSessionResponse(BaseModel):
    success: bool
    message: str
    deleted_sessions: List[str] = []


@router.post("/delete-session", response_model=DeleteSessionResponse)
async def delete_session(request: DeleteSessionRequest):
    """
    Delete/terminate a specific LiveAvatar session permanently.
    
    - **session_id**: Session ID to delete
    """
    try:
        # Delete the specific session via HeyGen API
        success, message = await heygen_live_service.delete_session(request.session_id)
        
        # Remove from active sessions
        session_manager.remove_session(request.session_id)
        
        return DeleteSessionResponse(
            success=success,
            message=message,
            deleted_sessions=[request.session_id] if success else []
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting session {request.session_id}: {str(e)}"
        )


@router.post("/aggressive-terminate", response_model=DeleteSessionResponse)
async def aggressive_terminate_sessions():
    """
    Aggressive termination: Uses direct HeyGen API to find and terminate ALL sessions.
    This bypasses our local session manager and goes directly to HeyGen.
    """
    try:
        # Get ALL sessions from HeyGen directly
        success, sessions, message = await heygen_session_api.get_all_sessions_paginated()
        
        if not success or not sessions:
            return DeleteSessionResponse(
                success=False,
                message="No sessions found to terminate",
                deleted_sessions=[]
            )
        
        # Extract session IDs
        session_ids = [session.get("session_id") for session in sessions if session.get("session_id")]
        
        if not session_ids:
            return DeleteSessionResponse(
                success=False,
                message="No valid session IDs found",
                deleted_sessions=[]
            )
        
        # Terminate all sessions
        terminated_count, terminated_ids, message = await heygen_session_api.terminate_all_sessions(session_ids)
        
        # Clear our local session manager
        for session_id in terminated_ids:
            session_manager.remove_session(session_id)
        
        return DeleteSessionResponse(
            success=terminated_count > 0,
            message=message,
            deleted_sessions=terminated_ids
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during aggressive termination: {str(e)}"
        )


@router.post("/comprehensive-cleanup", response_model=DeleteSessionResponse)
async def comprehensive_cleanup_sessions():
    """
    Comprehensive cleanup: Lists ALL sessions from HeyGen and deletes them.
    This is the most powerful cleanup method for stubborn concurrency issues.
    """
    try:
        cleaned_count, message = await heygen_live_service.cleanup_all_sessions()
        
        return DeleteSessionResponse(
            success=cleaned_count > 0,
            message=message,
            deleted_sessions=[f"session_{i}" for i in range(cleaned_count)]  # Generic IDs since we don't track them
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during comprehensive cleanup: {str(e)}"
        )


@router.post("/force-cleanup", response_model=DeleteSessionResponse)
async def force_cleanup_sessions():
    """
    Force cleanup all sessions using aggressive methods.
    This is more powerful than regular delete for stubborn sessions.
    """
    try:
        # Get all sessions we know about
        active_sessions = session_manager.get_active_sessions()
        
        # Also try to get sessions from HeyGen if possible
        # For now, just clean up what we have
        cleaned_count, message = await heygen_live_service.force_cleanup_sessions(active_sessions)
        
        return DeleteSessionResponse(
            success=cleaned_count > 0,
            message=message,
            deleted_sessions=active_sessions[:cleaned_count]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error force cleaning sessions: {str(e)}"
        )


@router.post("/delete-all-sessions", response_model=DeleteSessionResponse)
async def delete_all_sessions():
    """
    Delete/terminate all active LiveAvatar sessions permanently.
    """
    try:
        active_sessions = session_manager.get_active_sessions()
        deleted_count = 0
        errors = []
        deleted_sessions = []
        
        for session_id in active_sessions:
            try:
                success, message = await heygen_live_service.delete_session(session_id)
                if success:
                    deleted_count += 1
                    deleted_sessions.append(session_id)
                    session_manager.remove_session(session_id)
                else:
                    errors.append(f"Session {session_id}: {message}")
            except Exception as e:
                errors.append(f"Session {session_id}: {str(e)}")
        
        return DeleteSessionResponse(
            success=deleted_count > 0,
            message=f"Deleted {deleted_count} sessions. Errors: {len(errors)}" if errors else "All sessions deleted successfully",
            deleted_sessions=deleted_sessions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting all sessions: {str(e)}"
        )


class StopSessionRequest(BaseModel):
    session_id: str


class StopSessionResponse(BaseModel):
    success: bool
    message: str
    stopped_sessions: List[str] = []


class ListSessionsResponse(BaseModel):
    success: bool
    active_sessions: List[str] = []
    total_sessions: int
    message: str


@router.post("/stop-session", response_model=StopSessionResponse)
async def stop_session(request: StopSessionRequest):
    """
    Stop a specific LiveAvatar session.
    
    - **session_id**: Session ID to stop
    """
    try:
        # Stop the specific session via HeyGen API
        success, message = await heygen_live_service.stop_session(request.session_id)
        
        # Remove from active sessions
        session_manager.remove_session(request.session_id)
        
        return StopSessionResponse(
            success=success,
            message=message,
            stopped_sessions=[request.session_id] if success else []
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error stopping session {request.session_id}: {str(e)}"
        )


@router.post("/stop-all-sessions", response_model=StopSessionResponse)
async def stop_all_sessions():
    """
    Stop all active LiveAvatar sessions.
    """
    try:
        stopped_count, message = await session_manager.stop_all_sessions()
        
        return StopSessionResponse(
            success=stopped_count > 0,
            message=message,
            stopped_sessions=session_manager.get_active_sessions()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error stopping all sessions: {str(e)}"
        )


@router.get("/list-sessions", response_model=ListSessionsResponse)
async def list_sessions():
    """
    List all active sessions.
    """
    try:
        active_sessions = session_manager.get_active_sessions()
        
        return ListSessionsResponse(
            success=True,
            active_sessions=active_sessions,
            total_sessions=len(active_sessions),
            message=f"Found {len(active_sessions)} active sessions"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing sessions: {str(e)}"
        )


@router.delete("/cleanup-sessions", response_model=StopSessionResponse)
async def cleanup_expired_sessions():
    """
    Clean up expired sessions.
    """
    try:
        cleaned_count = session_manager.cleanup_expired_sessions()
        
        return StopSessionResponse(
            success=cleaned_count > 0,
            message=f"Cleaned {cleaned_count} expired sessions"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cleaning up sessions: {str(e)}"
        )
