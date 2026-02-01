import base64
import io
import tempfile
import os
from typing import Optional
from ..core.gemini_client import gemini_client
from ..core.config import settings

def get_file_tutor_prompt(language: str, file_name: str, file_type: str) -> str:
    """Generate system prompt for file tutoring in specified language."""
    return f"""You are an expert document analysis AI. You're analyzing a {file_type} file named "{file_name}".

IMPORTANT RULES:
1. ALWAYS respond in {language}. Every word of your response must be in {language}.
2. Analyze the file content carefully and provide helpful explanations.
3. If it's a PDF/Word document, summarize the key points and structure.
4. If it's an Excel/CSV file, analyze the data patterns and insights.
5. If it's a PowerPoint, summarize the presentation content.
6. If it's an image, describe what you see in detail.
7. Provide actionable insights and recommendations based on the content.
8. Be specific about what you observe in the file.
9. Offer to answer specific questions about the content.

Remember: Your entire response must be in {language}."""

async def analyze_file(file_base64: str, file_name: str, file_type: str, language: str) -> str:
    """
    Analyze an uploaded file using Gemini Vision API.
    
    Args:
        file_base64: Base64 encoded file content
        file_name: Original filename
        file_type: MIME type of the file
        language: Target response language
        
    Returns:
        AI-generated analysis in specified language
    """
    try:
        # Decode base64 content
        file_content = base64.b64decode(file_base64)
        
        # Determine if we should use vision or text model
        is_image_file = file_type.startswith('image/')
        
        if is_image_file:
            # Use vision model for images
            model = gemini_client.GenerativeModel(settings.gemini_vision_model)
            
            content = [
                get_file_tutor_prompt(language, file_name, file_type),
                f"This is an image file named '{file_name}'. Please analyze what you see and provide insights in {language}.",
                {
                    "mime_type": file_type,
                    "data": file_base64
                }
            ]
            
            response = model.generate_content(
                content,
                generation_config={
                    "max_output_tokens": 2000,
                    "temperature": 0.7,
                }
            )
            
            return response.text or f"Unable to analyze the image {file_name}."
            
        else:
            # Use text model for documents
            model = gemini_client.GenerativeModel(settings.gemini_text_model)
            
            # Try to extract text from the file
            text_content = await extract_text_from_file(file_content, file_type, file_name)
            
            if not text_content:
                return f"Unable to extract text from {file_name}. The file might be corrupted or in an unsupported format."
            
            # Truncate content if too long (Gemini has limits)
            max_chars = 100000  # Conservative limit
            if len(text_content) > max_chars:
                text_content = text_content[:max_chars] + "\n\n[Content truncated due to length...]"
            
            content = [
                get_file_tutor_prompt(language, file_name, file_type),
                f"This is the content of {file_name} ({file_type}). Please analyze it and provide insights in {language}:\n\n{text_content}"
            ]
            
            response = model.generate_content(
                content,
                generation_config={
                    "max_output_tokens": 2000,
                    "temperature": 0.7,
                }
            )
            
            return response.text or f"Unable to analyze the content of {file_name}."
            
    except Exception as e:
        print(f"Error analyzing file {file_name}: {str(e)}")
        return f"Error analyzing {file_name}: {str(e)}"

async def extract_text_from_file(file_content: bytes, file_type: str, file_name: str) -> Optional[str]:
    """
    Extract text from various file types.
    
    Args:
        file_content: Raw file bytes
        file_type: MIME type
        file_name: Filename
        
    Returns:
        Extracted text content or None if extraction failed
    """
    try:
        # For text files, decode directly
        if file_type.startswith('text/'):
            return file_content.decode('utf-8', errors='ignore')
        
        # For other file types, we'll need additional libraries
        # For now, return a basic response
        if file_type == 'application/pdf':
            return "[PDF content extraction would require PyPDF2 or similar library]"
        elif 'word' in file_type:
            return "[Word document extraction would require python-docx or similar library]"
        elif 'excel' in file_type or file_type == 'text/csv':
            return "[Excel/CSV extraction would require openpyxl or pandas library]"
        elif 'powerpoint' in file_type:
            return "[PowerPoint extraction would require python-pptx or similar library]"
        else:
            return f"[Content extraction for {file_type} is not yet implemented]"
            
    except Exception as e:
        print(f"Error extracting text from {file_name}: {str(e)}")
        return None
