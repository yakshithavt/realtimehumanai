from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ...services.note_service import note_service
from ...models.response_models import NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])


class NoteResponse(BaseModel):
    """Response model for note endpoints."""
    success: bool
    data: Optional[dict] = None
    message: str


@router.post("/create", response_model=NoteResponse)
async def create_note(request: dict):
    """
    Create a new note from AI response.
    
    Expected payload:
    {
        "title": "Important concept",
        "content": "The AI response content",
        "source_type": "chat",
        "source_content": "Original user message",
        "tags": ["python", "programming"],
        "category": "Learning"
    }
    """
    try:
        from ...services.note_service import CreateNoteRequest
        
        create_request = CreateNoteRequest(
            title=request.get("title", "Untitled Note"),
            content=request.get("content", ""),
            source_type=request.get("source_type", "chat"),
            source_content=request.get("source_content"),
            tags=request.get("tags", []),
            category=request.get("category")
        )
        
        note = note_service.create_note(create_request)
        
        return NoteResponse(
            success=True,
            data={
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "source_type": note.source_type,
                "tags": note.tags,
                "category": note.category,
                "is_favorite": note.is_favorite,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat()
            },
            message="Note created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating note: {str(e)}"
        )


@router.get("/list", response_model=NoteResponse)
async def list_notes(
    category: Optional[str] = Query(None, description="Filter by category"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    source_type: Optional[str] = Query(None, description="Filter by source type"),
    is_favorite: Optional[bool] = Query(None, description="Filter favorites only"),
    limit: int = Query(default=50, ge=1, le=100, description="Maximum notes to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset")
):
    """List notes with optional filters."""
    try:
        tag_list = tags.split(',') if tags else None
        
        notes = note_service.list_notes(
            category=category,
            tags=tag_list,
            source_type=source_type,
            is_favorite=is_favorite,
            limit=limit,
            offset=offset
        )
        
        return NoteResponse(
            success=True,
            data={
                "notes": [
                    {
                        "id": note.id,
                        "title": note.title,
                        "content": note.content,
                        "source_type": note.source_type,
                        "tags": note.tags,
                        "category": note.category,
                        "is_favorite": note.is_favorite,
                        "created_at": note.created_at.isoformat(),
                        "updated_at": note.updated_at.isoformat()
                    }
                    for note in notes
                ],
                "total": len(notes)
            },
            message=f"Retrieved {len(notes)} notes"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing notes: {str(e)}"
        )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    """Get a specific note by ID."""
    try:
        note = note_service.get_note(note_id)
        
        if not note:
            raise HTTPException(
                status_code=404,
                detail="Note not found"
            )
        
        return NoteResponse(
            success=True,
            data={
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "source_type": note.source_type,
                "source_content": note.source_content,
                "tags": note.tags,
                "category": note.category,
                "is_favorite": note.is_favorite,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
                "metadata": note.metadata
            },
            message="Note retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving note: {str(e)}"
        )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, request: dict):
    """
    Update an existing note.
    
    Expected payload:
    {
        "title": "Updated title",
        "content": "Updated content",
        "tags": ["new", "tags"],
        "category": "Updated category",
        "is_favorite": true
    }
    """
    try:
        from ...services.note_service import UpdateNoteRequest
        
        update_request = UpdateNoteRequest(
            title=request.get("title"),
            content=request.get("content"),
            tags=request.get("tags"),
            category=request.get("category"),
            is_favorite=request.get("is_favorite")
        )
        
        note = note_service.update_note(note_id, update_request)
        
        if not note:
            raise HTTPException(
                status_code=404,
                detail="Note not found"
            )
        
        return NoteResponse(
            success=True,
            data={
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "tags": note.tags,
                "category": note.category,
                "is_favorite": note.is_favorite,
                "updated_at": note.updated_at.isoformat()
            },
            message="Note updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating note: {str(e)}"
        )


@router.delete("/{note_id}", response_model=NoteResponse)
async def delete_note(note_id: str):
    """Delete a note."""
    try:
        success = note_service.delete_note(note_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Note not found"
            )
        
        return NoteResponse(
            success=True,
            message="Note deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting note: {str(e)}"
        )


@router.get("/search/{query}", response_model=NoteResponse)
async def search_notes(query: str):
    """Search notes by title, content, or tags."""
    try:
        notes = note_service.search_notes(query)
        
        return NoteResponse(
            success=True,
            data={
                "notes": [
                    {
                        "id": note.id,
                        "title": note.title,
                        "content": note.content,
                        "source_type": note.source_type,
                        "tags": note.tags,
                        "category": note.category,
                        "is_favorite": note.is_favorite,
                        "created_at": note.created_at.isoformat(),
                        "updated_at": note.updated_at.isoformat()
                    }
                    for note in notes
                ],
                "total": len(notes),
                "query": query
            },
            message=f"Found {len(notes)} notes for '{query}'"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching notes: {str(e)}"
        )


@router.get("/categories/list", response_model=NoteResponse)
async def get_categories():
    """Get all available categories."""
    try:
        categories = note_service.get_categories()
        
        return NoteResponse(
            success=True,
            data={
                "categories": categories
            },
            message=f"Retrieved {len(categories)} categories"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving categories: {str(e)}"
        )


@router.post("/categories/add", response_model=NoteResponse)
async def add_category(request: dict):
    """Add a new category."""
    try:
        category = request.get("category")
        if not category:
            raise HTTPException(
                status_code=400,
                detail="Category name is required"
            )
        
        success = note_service.add_category(category)
        
        if success:
            return NoteResponse(
                success=True,
                message=f"Category '{category}' added successfully"
            )
        else:
            return NoteResponse(
                success=False,
                message=f"Category '{category}' already exists"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding category: {str(e)}"
        )


@router.get("/stats", response_model=NoteResponse)
async def get_note_stats():
    """Get note statistics."""
    try:
        stats = note_service.get_stats()
        
        return NoteResponse(
            success=True,
            data=stats,
            message="Note statistics retrieved successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving stats: {str(e)}"
        )
