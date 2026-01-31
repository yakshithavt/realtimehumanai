from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .models.response_models import HealthResponse
from .api.routes import vision, chat, heygen, screen_share, live_avatar, websocket, diagnostics, session_management

# Create FastAPI application
app = FastAPI(
    title="AI Vision Avatar Tutor API",
    description="Backend API for the AI Vision Avatar Tutor platform - featuring image analysis, multilingual chat, screen tutoring, and HeyGen avatar generation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(vision.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(heygen.router, prefix="/api")
app.include_router(screen_share.router, prefix="/api")
app.include_router(live_avatar.router, prefix="/api")
app.include_router(websocket.router)
app.include_router(diagnostics.router, prefix="/api")
app.include_router(session_management.router, prefix="/api")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify API is running."""
    return HealthResponse(
        status="healthy",
        message="AI Vision Avatar Tutor API is running",
    )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "AI Vision Avatar Tutor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
