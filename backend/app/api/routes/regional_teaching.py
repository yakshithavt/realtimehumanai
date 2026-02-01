from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
from ..services.regional_ai_teaching_engine import regional_ai_teaching_engine

router = APIRouter(prefix="/api/regional-teaching", tags=["Regional AI Teaching"])

@router.post("/generate-lesson")
async def generate_regional_lesson(request: Dict[str, Any]):
    """Generate lesson in regional language"""
    try:
        subject = request.get("subject", "mathematics")
        topic = request.get("topic", "algebra")
        language = request.get("language", "en")
        difficulty = request.get("difficulty", "intermediate")
        
        lesson = await regional_ai_teaching_engine.generate_regional_lesson(
            subject, topic, language, difficulty
        )
        
        return lesson
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lesson: {str(e)}")

@router.post("/ask-question")
async def ask_regional_question(request: Dict[str, Any]):
    """Ask question in regional language"""
    try:
        question = request.get("question", "")
        subject = request.get("subject", "general")
        language = request.get("language", "en")
        context = request.get("context")
        
        answer = await regional_ai_teaching_engine.answer_regional_question(
            question, subject, language, context
        )
        
        return answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")

@router.get("/teaching-modes/{language}")
async def get_regional_teaching_modes(language: str):
    """Get teaching modes in regional language"""
    try:
        modes = regional_ai_teaching_engine.get_regional_teaching_modes(language)
        return {
            "success": True,
            "language": language,
            "teaching_modes": modes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting teaching modes: {str(e)}")

@router.get("/supported-subjects")
async def get_supported_subjects():
    """Get all supported subjects for regional teaching"""
    try:
        subjects = [
            {
                "id": "mathematics",
                "name": "Mathematics",
                "topics": ["algebra", "geometry", "calculus", "statistics"]
            },
            {
                "id": "science",
                "name": "Science", 
                "topics": ["physics", "chemistry", "biology", "astronomy"]
            },
            {
                "id": "coding",
                "name": "Programming",
                "topics": ["python", "javascript", "java", "web-development"]
            }
        ]
        
        return {
            "success": True,
            "subjects": subjects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting subjects: {str(e)}")

@router.get("/regional-languages")
async def get_regional_languages():
    """Get all supported regional languages"""
    try:
        # This would come from the multi_language_service
        languages = [
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी", "region": "India"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்", "region": "India"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు", "region": "India"},
            {"code": "bn", "name": "Bengali", "native_name": "বাংলা", "region": "India"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी", "region": "India"},
            {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી", "region": "India"},
            {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ", "region": "India"},
            {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം", "region": "India"},
            {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "region": "India"},
            {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ", "region": "India"},
            {"code": "as", "name": "Assamese", "native_name": "অসমীয়া", "region": "India"},
            {"code": "ur", "name": "Urdu", "native_name": "اردو", "region": "India"}
        ]
        
        return {
            "success": True,
            "regional_languages": languages,
            "total": len(languages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting regional languages: {str(e)}")
