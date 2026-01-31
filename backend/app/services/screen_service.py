import base64
from ..core.gemini_client import gemini_client
from ..core.config import settings


def get_screen_tutor_prompt(language: str) -> str:
    """Generate system prompt for screen tutoring in specified language."""
    return f"""You are an expert screen tutor AI. You're viewing a user's screen and helping them understand what they see.

IMPORTANT RULES:
1. ALWAYS respond in {language}. Every word of your response must be in {language}.
2. Analyze the screen content carefully and provide helpful explanations.
3. If you see code, explain what it does step-by-step.
4. If you see an error message, explain what it means and how to fix it.
5. If you see a UI/application, explain how to use it.
6. Be specific about what you observe in the screen.
7. Offer practical tips and next steps.

Remember: Your entire response must be in {language}."""


async def analyze_screen_frame(frame_base64: str, language: str) -> str:
    """
    Analyze a screen capture frame using Gemini Vision API.
    
    Args:
        frame_base64: Base64 encoded image of screen frame
        language: Target response language
        
    Returns:
        AI-generated analysis in specified language
    """
    # Create vision request with Gemini
    model = gemini_client.GenerativeModel(settings.gemini_vision_model)
    
    # Prepare the content with screen frame
    content = [
        get_screen_tutor_prompt(language),
        f"This is a capture of my screen. Please analyze what you see and help me understand it. Explain in {language}.",
        {
            "mime_type": "image/jpeg",
            "data": frame_base64
        }
    ]
    
    response = model.generate_content(
        content,
        generation_config={
            "max_output_tokens": 2000,
            "temperature": 0.7,
        }
    )
    
    return response.text or "Unable to analyze screen."
