from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-vision-preview"
    
    GOOGLE_API_KEY: str
    GOOGLE_MODEL: str = "gemini-pro-vision"
    
    ANTHROPIC_API_KEY: str
    ANTHROPIC_MODEL: str = "claude-3-opus-20240229"
    
    # Database
    DATABASE_URL: str = "sqlite:///./ai_teacher.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Teaching Configuration
    MAX_STUDENTS_PER_CLASS: int = 50
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: str = "en,es,fr,de,zh,ja,ar,hi,pt,ru"
    
    # 3D Visualization
    THREE_JS_VERSION: str = "0.160.0"
    WEBGL_RENDERER: str = "webgl2"
    MAX_3D_MODELS: int = 1000
    
    # Avatar System
    AVATAR_VOICE_ENGINE: str = "elevenlabs"
    AVATAR_MODEL_QUALITY: str = "high"
    MAX_CONCURRENT_AVATARS: int = 10
    
    # Hardware Lab
    HARDWARE_SIMULATION_ENGINE: str = "physicsjs"
    MAX_COMPONENTS_PER_CIRCUIT: int = 50
    SOLDERING_SIMULATION_ENABLED: bool = True
    
    # Analytics
    ANALYTICS_ENABLED: bool = True
    LEARNING_DATA_RETENTION_DAYS: int = 365
    PERFORMANCE_MONITORING: bool = True
    
    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    RATE_LIMIT_PER_MINUTE: int = 100
    SESSION_TIMEOUT_MINUTES: int = 60
    
    # Development
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
