import base64
from typing import Optional
from ..core.openai_client import openai_client
from ..core.config import settings


def get_tutor_system_prompt(language: str) -> str:
    """Generate system prompt for AI tutor in specified language."""
    return f"""You are a friendly, knowledgeable AI tutor. Your role is to explain concepts clearly and step-by-step.

IMPORTANT RULES:
1. ALWAYS respond in {language}. Every word of your response must be in {language}.
2. Be encouraging and patient, like a great teacher.
3. Use simple language and break down complex ideas.
4. When analyzing images, describe what you see and explain any concepts shown.
5. Use bullet points and numbered lists for clarity when appropriate.
6. If you see code, math, or diagrams, explain them thoroughly.
7. Ask follow-up questions to ensure understanding.

Remember: Your entire response must be in {language}."""


async def analyze_image(image_bytes: bytes, language: str, filename: str) -> str:
    """
    Analyze an image using OpenAI Vision API.
    
    Args:
        image_bytes: Raw image bytes
        language: Target response language
        filename: Original filename for context
        
    Returns:
        AI-generated analysis in specified language
    """
    # Encode image to base64
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    
    # Determine image type from filename
    extension = filename.lower().split(".")[-1]
    mime_types = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "webp": "image/webp",
    }
    mime_type = mime_types.get(extension, "image/jpeg")
    
    # Create vision request
    response = openai_client.chat.completions.create(
        model=settings.openai_vision_model,
        messages=[
            {
                "role": "system",
                "content": get_tutor_system_prompt(language),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Please analyze this image and explain what you see in detail. Respond in {language}.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}",
                            "detail": "high",
                        },
                    },
                ],
            },
        ],
        max_tokens=2000,
        temperature=0.7,
    )
    
    return response.choices[0].message.content or "Unable to analyze image."
