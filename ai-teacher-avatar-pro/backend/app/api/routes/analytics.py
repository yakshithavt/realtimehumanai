from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

from ..services.analytics_service import analytics_service
from ..services.student_management import student_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/student/{student_id}")
async def get_student_analytics(student_id: str):
    """Get comprehensive analytics for a student"""
    try:
        progress_data = await analytics_service.get_student_progress(student_id)
        student_profile = await student_service.get_student(student_id)
        
        return {
            "success": True,
            "student_profile": student_profile,
            "progress_data": progress_data,
            "total_sessions": len(progress_data),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_analytics():
    """Get overall dashboard analytics"""
    return {
        "success": True,
        "total_students": len(student_service.students),
        "active_sessions": len(analytics_service.sessions),
        "total_progress_entries": len(analytics_service.progress),
        "system_status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
