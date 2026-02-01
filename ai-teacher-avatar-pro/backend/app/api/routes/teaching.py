from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime

from ..services.ai_teaching_engine import ai_teaching_engine
from ..models.teaching_models import (
    TeachingRequest, TeachingResponse, TeachingLesson,
    StudentProfile, LearningProgress, SessionAnalytics
)
from ..services.student_management import student_service
from ..services.analytics_service import analytics_service

router = APIRouter(prefix="/teaching", tags=["AI Teaching"])

# Active teaching sessions
active_sessions: Dict[str, WebSocket] = {}

@router.post("/start-lesson", response_model=TeachingResponse)
async def start_teaching_lesson(request: TeachingRequest):
    """Start a new interactive teaching lesson"""
    try:
        # Validate student
        student = await student_service.get_student(request.student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Generate teaching lesson
        lesson = await ai_teaching_engine.generate_teaching_lesson(request)
        
        # Generate avatar response
        avatar_response = await ai_teaching_engine._generate_avatar_response(request, lesson.dict())
        
        # Create session analytics
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{request.student_id}"
        analytics = SessionAnalytics(
            session_id=session_id,
            student_id=request.student_id,
            start_time=datetime.now(),
            teaching_mode=request.teaching_mode,
            topic=request.topic,
            engagement_score=0.0,
            questions_asked=0,
            correct_answers=0,
            help_requested=0,
            completion_status="started"
        )
        
        await analytics_service.create_session(analytics)
        
        return TeachingResponse(
            success=True,
            lesson=lesson,
            avatar_response=avatar_response,
            message="Lesson started successfully",
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start lesson: {str(e)}")

@router.post("/ask-question")
async def ask_teacher_question(
    student_id: str,
    session_id: str,
    question: str,
    context: Optional[Dict[str, Any]] = None
):
    """Ask a question during a teaching session"""
    try:
        # Get session context
        session = await analytics_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Answer the question
        answer = await ai_teaching_engine.answer_student_question(
            question, 
            context or {}
        )
        
        # Update analytics
        session.questions_asked += 1
        await analytics_service.update_session(session_id, session.dict())
        
        return {
            "success": True,
            "answer": answer,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to answer question: {str(e)}")

@router.post("/update-progress")
async def update_learning_progress(
    student_id: str,
    topic: str,
    mastery_level: float,
    time_spent_minutes: int,
    completion_rate: float
):
    """Update student learning progress"""
    try:
        progress = LearningProgress(
            student_id=student_id,
            topic=topic,
            mastery_level=mastery_level,
            time_spent_minutes=time_spent_minutes,
            completion_rate=completion_rate,
            strengths_demonstrated=[],
            areas_for_improvement=[],
            last_updated=datetime.now()
        )
        
        await analytics_service.update_progress(progress)
        
        return {
            "success": True,
            "message": "Progress updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

@router.get("/student-progress/{student_id}")
async def get_student_progress(student_id: str):
    """Get comprehensive student progress"""
    try:
        progress_data = await analytics_service.get_student_progress(student_id)
        student_profile = await student_service.get_student(student_id)
        
        return {
            "success": True,
            "student_profile": student_profile.dict() if student_profile else None,
            "progress_data": progress_data,
            "recommendations": await generate_recommendations(student_id)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")

@router.websocket("/live-session/{session_id}")
async def live_teaching_session(websocket: WebSocket, session_id: str):
    """WebSocket for live interactive teaching sessions"""
    await websocket.accept()
    active_sessions[session_id] = websocket
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "question":
                # Handle student question
                answer = await ai_teaching_engine.answer_student_question(
                    message["question"],
                    message.get("context", {})
                )
                
                response = {
                    "type": "answer",
                    "answer": answer,
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send_text(json.dumps(response))
                
            elif message["type"] == "interaction":
                # Handle student interaction (click, gesture, etc.)
                await handle_student_interaction(session_id, message)
                
            elif message["type"] == "progress_update":
                # Handle progress update
                await handle_progress_update(session_id, message)
                
    except WebSocketDisconnect:
        # Clean up session
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        # Update session analytics
        await analytics_service.complete_session(session_id)

async def handle_student_interaction(session_id: str, message: Dict[str, Any]):
    """Handle student interactions during live session"""
    try:
        # Update engagement score
        session = await analytics_service.get_session(session_id)
        if session:
            session.engagement_score = min(1.0, session.engagement_score + 0.1)
            await analytics_service.update_session(session_id, session.dict())
        
        # Send interaction acknowledgment
        if session_id in active_sessions:
            response = {
                "type": "interaction_acknowledged",
                "interaction": message["interaction_type"],
                "timestamp": datetime.now().isoformat()
            }
            await active_sessions[session_id].send_text(json.dumps(response))
            
    except Exception as e:
        print(f"Error handling interaction: {e}")

async def handle_progress_update(session_id: str, message: Dict[str, Any]):
    """Handle progress updates during live session"""
    try:
        # Update session analytics
        session = await analytics_service.get_session(session_id)
        if session:
            if message.get("correct_answer"):
                session.correct_answers += 1
            if message.get("help_requested"):
                session.help_requested += 1
            
            await analytics_service.update_session(session_id, session.dict())
        
        # Send progress acknowledgment
        if session_id in active_sessions:
            response = {
                "type": "progress_acknowledged",
                "progress": message.get("progress", 0),
                "timestamp": datetime.now().isoformat()
            }
            await active_sessions[session_id].send_text(json.dumps(response))
            
    except Exception as e:
        print(f"Error handling progress update: {e}")

async def generate_recommendations(student_id: str) -> List[str]:
    """Generate personalized learning recommendations"""
    try:
        # Get student progress data
        progress_data = await analytics_service.get_student_progress(student_id)
        student_profile = await student_service.get_student(student_id)
        
        recommendations = []
        
        if not student_profile:
            return recommendations
        
        # Analyze strengths and weaknesses
        for progress in progress_data:
            if progress.mastery_level < 0.5:
                recommendations.append(f"Focus more on {progress.topic} - current mastery: {progress.mastery_level:.0%}")
            elif progress.mastery_level > 0.8:
                recommendations.append(f"Great progress in {progress.topic}! Consider advanced topics.")
        
        # Add general recommendations based on learning style
        if student_profile.learning_style.value == "visual":
            recommendations.append("Try more visual demonstrations and diagrams")
        elif student_profile.learning_style.value == "kinesthetic":
            recommendations.append("Include more hands-on activities and experiments")
        
        return recommendations
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return ["Continue with your current learning path"]

@router.get("/available-topics")
async def get_available_topics():
    """Get list of available teaching topics"""
    return {
        "success": True,
        "topics": {
            "hardware_lab": [
                "Arduino Basics",
                "LED Circuit Design",
                "Sensor Integration",
                "Motor Control",
                "IoT Projects",
                "Raspberry Pi Setup",
                "PCB Design",
                "Robotics Assembly"
            ],
            "math_whiteboard": [
                "Algebra Basics",
                "Geometry Fundamentals",
                "Calculus Introduction",
                "Statistics and Probability",
                "Linear Algebra",
                "Trigonometry",
                "Problem Solving Strategies",
                "Mathematical Proofs"
            ],
            "science_simulation": [
                "Physics Mechanics",
                "Chemical Reactions",
                "Biology Basics",
                "Electricity and Magnetism",
                "Thermodynamics",
                "Optics and Light",
                "Scientific Method",
                "Laboratory Safety"
            ],
            "coding_workshop": [
                "Python Programming",
                "Web Development",
                "JavaScript Basics",
                "Data Structures",
                "Algorithms",
                "Machine Learning",
                "App Development",
                "Database Design"
            ]
        }
    }

@router.get("/health")
async def teaching_health_check():
    """Health check for teaching engine"""
    try:
        # Test AI providers
        test_result = await ai_teaching_engine._generate_with_google("Test", None)
        
        return {
            "status": "healthy",
            "ai_providers": "operational",
            "active_sessions": len(active_sessions),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
