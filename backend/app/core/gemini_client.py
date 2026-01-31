import google.generativeai as genai
from .config import settings


def get_gemini_client():
    """Get configured Gemini client instance."""
    genai.configure(api_key=settings.google_api_key)
    return genai


# Singleton client instance
gemini_client = get_gemini_client()
