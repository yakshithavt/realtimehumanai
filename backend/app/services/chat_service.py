from typing import Optional
from ..core.gemini_client import gemini_client
from ..core.config import settings


def get_tutor_system_prompt(language: str) -> str:
    """Generate system prompt for AI tutor in specified language."""
    return f"""You are a friendly, knowledgeable AI tutor. Your role is to explain concepts clearly and step-by-step.

IMPORTANT RULES:
1. ALWAYS respond in {language}. Every word of your response must be in {language}.
2. Be encouraging and patient, like a great teacher.
3. Use simple language and break down complex ideas.
4. Use bullet points and numbered lists for clarity when appropriate.
5. Ask follow-up questions to ensure understanding.
6. If the user provides context from a previous image or screen analysis, use it to provide more relevant answers.

Remember: Your entire response must be in {language}."""


async def chat_respond(message: str, language: str, context: Optional[str] = None) -> str:
    """
    Generate a chat response using OpenAI API.
    
    Args:
        message: User's message
        language: Target response language
        context: Optional previous context (e.g., from image analysis)
        
    Returns:
        AI-generated response in specified language
    """
    messages = [
        {
            "role": "system",
            "content": get_tutor_system_prompt(language),
        }
    ]
    
    # Add context if available
    if context:
        messages.append({
            "role": "assistant",
            "content": f"[Previous analysis context: {context}]",
        })
    
    # Add user message
    messages.append({
        "role": "user",
        "content": f"{message}\n\n(Please respond in {language})",
    })
    
    # Combine messages into a single prompt for Gemini
    conversation_parts = []
    for msg in messages:
        if msg["role"] == "system":
            conversation_parts.append(f"System: {msg['content']}")
        elif msg["role"] == "user":
            conversation_parts.append(f"User: {msg['content']}")
        elif msg["role"] == "assistant":
            conversation_parts.append(f"Assistant: {msg['content']}")
    
    full_prompt = "\n\n".join(conversation_parts)
    
    response = gemini_client.GenerativeModel(settings.gemini_model).generate_content(
        full_prompt,
        generation_config={
            "max_output_tokens": 2000,
            "temperature": 0.7,
        }
    )
    
    return response.text or "Unable to generate response."
