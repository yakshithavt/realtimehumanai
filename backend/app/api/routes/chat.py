from fastapi import APIRouter, HTTPException
from ...models.request_models import ChatRequest
from ...models.response_models import ChatResponse
from ...services.chat_service import chat_respond

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/respond", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat with the AI tutor.
    
    - **message**: User's question or message
    - **language**: Language for the AI response
    - **context**: Optional context from previous analysis
    """
    try:
        response_text = await chat_respond(
            message=request.message,
            language=request.language,
            context=request.context,
        )
        
        return ChatResponse(
            success=True,
            response=response_text,
            language=request.language,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}",
        )
