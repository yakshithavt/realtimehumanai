from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Gemini AI Configuration
    google_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_vision_model: str = "gemini-2.5-flash"
    
    # HeyGen Configuration
    heygen_api_key: str = ""
    heygen_api_url: str = "https://api.heygen.com/v2"
    default_avatar_id: str = ""
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080,http://localhost:8000,null"
    
    # Server Configuration
    debug: bool = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
