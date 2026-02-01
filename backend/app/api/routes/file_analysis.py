from fastapi import APIRouter, HTTPException, UploadFile, File
from ...models.request_models import FileAnalysisRequest
from ...models.response_models import FileAnalysisResponse
from ...services.file_service import analyze_file

router = APIRouter(prefix="/chat", tags=["File Analysis"])

@router.post("/respond/file", response_model=FileAnalysisResponse)
async def analyze_file_endpoint(request: FileAnalysisRequest):
    """
    Analyze an uploaded file (PDF, Word, Excel, etc.).
    
    - **file**: Base64 encoded file content
    - **fileName**: Original filename
    - **fileType**: MIME type of the file
    - **language**: Language for the AI response
    """
    try:
        # Validate file data
        if len(request.file) < 100:
            raise HTTPException(
                status_code=400,
                detail="Invalid file data. Must be base64 encoded.",
            )
        
        # Check file size (10MB limit)
        file_size = len(request.file) * 3 / 4  # Approximate base64 to bytes conversion
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 10MB.",
            )
        
        response_text = await analyze_file(
            file_base64=request.file,
            file_name=request.fileName,
            file_type=request.fileType,
            language=request.language,
        )
        
        return FileAnalysisResponse(
            success=True,
            response=response_text,
            language=request.language,
            fileName=request.fileName,
            fileType=request.fileType,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing file: {str(e)}",
        )
