from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import time

# Create FastAPI application
app = FastAPI(
    title="AI Teacher Avatar Pro API",
    description="Advanced AI-powered educational platform with live interactive teaching demos",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include i18n routes
from .api.routes.i18n_new import router as i18n_router
app.include_router(i18n_router)

# Import and include regional teaching routes
from .api.routes.regional_teaching import router as regional_teaching_router
app.include_router(regional_teaching_router)

# Teaching API endpoints
@app.post("/api/teaching/start-lesson")
async def start_lesson(lesson_data: dict):
    """Start a new teaching lesson"""
    return {
        "success": True,
        "session_id": f"session_{lesson_data.get('topic', 'unknown')}_{int(time.time())}",
        "message": "Lesson started successfully",
        "topic": lesson_data.get("topic"),
        "mode": lesson_data.get("mode"),
        "difficulty": lesson_data.get("difficulty", "intermediate")
    }

@app.post("/api/teaching/ask-question")
async def ask_question(question_data: dict):
    """Ask a question during lesson"""
    question = question_data.get("question", "")
    topic = question_data.get("topic", "")
    
    # Mock AI responses
    responses = {
        "algebra": "To solve 2x + 5 = 13, subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
        "physics": "Ohm's Law states that V = IR, where voltage equals current times resistance",
        "chemistry": "Water is H2O - two hydrogen atoms bonded to one oxygen atom",
        "coding": "A function is a reusable block of code that performs a specific task"
    }
    
    response = responses.get(topic.lower(), "That's a great question! Let me explain it step by step...")
    
    return {
        "success": True,
        "answer": response,
        "question": question,
        "confidence": 0.95
    }

@app.post("/api/teaching/update-progress")
async def update_progress(progress_data: dict):
    """Update student progress"""
    return {
        "success": True,
        "message": "Progress updated successfully",
        "progress": progress_data.get("progress", 0),
        "topic": progress_data.get("topic")
    }

@app.get("/api/teaching/topics")
async def get_available_topics():
    """Get available teaching topics"""
    return {
        "success": True,
        "topics": [
            {"id": "algebra", "name": "Algebra Basics", "category": "mathematics"},
            {"id": "physics", "name": "Basic Physics", "category": "science"},
            {"id": "chemistry", "name": "Chemistry Fundamentals", "category": "science"},
            {"id": "coding", "name": "Programming Basics", "category": "technology"},
            {"id": "geometry", "name": "Geometry", "category": "mathematics"},
            {"id": "biology", "name": "Biology Basics", "category": "science"}
        ]
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Teacher Avatar Pro",
        "version": "3.0.0",
        "environment": "development"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AI Teacher Avatar Pro API",
        "version": "3.0.0",
        "description": "Advanced AI-powered educational platform with regional language support",
        "features": ["Multi-language support", "Regional languages", "AI teaching", "Interactive demos"],
        "docs": "/docs",
        "health": "/api/health"
    }

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
