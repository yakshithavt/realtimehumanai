from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...services.analytics_service import analytics_service
from ...models.response_models import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/usage-stats", response_model=AnalyticsResponse)
async def get_usage_stats(days: int = Query(default=30, ge=1, le=365)):
    """
    Get usage statistics for the last N days.
    
    - **days**: Number of days to analyze (1-365)
    """
    try:
        stats = analytics_service.get_usage_stats(days)
        
        return AnalyticsResponse(
            success=True,
            data={
                "total_sessions": stats.total_sessions,
                "total_messages": stats.total_messages,
                "total_images_analyzed": stats.total_images_analyzed,
                "total_files_uploaded": stats.total_files_uploaded,
                "total_screen_shares": stats.total_screen_shares,
                "active_users_today": stats.active_users_today,
                "avg_session_duration": stats.avg_session_duration,
                "popular_modes": stats.popular_modes,
                "daily_activity": stats.daily_activity
            },
            message="Usage statistics retrieved successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving usage stats: {str(e)}"
        )


@router.get("/real-time")
async def get_real_time_stats():
    """Get real-time analytics statistics."""
    try:
        stats = analytics_service.get_real_time_stats()
        
        return {
            "success": True,
            "data": stats,
            "message": "Real-time stats retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving real-time stats: {str(e)}"
        )


@router.post("/track")
async def track_event(event_data: dict):
    """
    Track an analytics event.
    
    Expected payload:
    {
        "event_type": "message_sent",
        "user_id": "user123",
        "session_id": "session456",
        "metadata": {"mode": "chat", "message_length": 150}
    }
    """
    try:
        event_type = event_data.get("event_type")
        user_id = event_data.get("user_id")
        session_id = event_data.get("session_id")
        metadata = event_data.get("metadata", {})
        
        if not event_type:
            raise HTTPException(
                status_code=400,
                detail="event_type is required"
            )
        
        analytics_service.track_event(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            metadata=metadata
        )
        
        return {
            "success": True,
            "message": "Event tracked successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking event: {str(e)}"
        )


@router.get("/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data."""
    try:
        # Get various stats
        usage_stats = analytics_service.get_usage_stats(30)
        real_time_stats = analytics_service.get_real_time_stats()
        
        # Combine for dashboard
        dashboard_data = {
            "overview": {
                "total_sessions": usage_stats.total_sessions,
                "total_messages": usage_stats.total_messages,
                "active_users_today": usage_stats.active_users_today,
                "total_activity_today": real_time_stats["total_activity_today"]
            },
            "activity": {
                "daily_activity": usage_stats.daily_activity,
                "popular_modes": usage_stats.popular_modes,
                "top_mode_today": real_time_stats["top_mode_today"]
            },
            "features": {
                "images_analyzed": usage_stats.total_images_analyzed,
                "files_uploaded": usage_stats.total_files_uploaded,
                "screen_shares": usage_stats.total_screen_shares
            },
            "real_time": real_time_stats
        }
        
        return {
            "success": True,
            "data": dashboard_data,
            "message": "Dashboard data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving dashboard data: {str(e)}"
        )
