from openai import OpenAI
from .config import settings


def get_openai_client() -> OpenAI:
    """Get configured OpenAI client instance."""
    return OpenAI(api_key=settings.openai_api_key)


# Singleton client instance
openai_client = get_openai_client()
