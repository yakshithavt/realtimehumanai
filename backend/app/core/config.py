from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    HEYGEN_API_KEY: str = ""
    DEFAULT_AVATAR_ID: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
