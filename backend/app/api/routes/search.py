from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ...services.search_service import search_service

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = {}
    limit: int = 50
    offset: int = 0


class IndexMessageRequest(BaseModel):
    id: str
    content: str
    role: str
    timestamp: str
    type: Optional[str] = "text"
    language: Optional[str] = None


@router.post("/search")
async def search_messages(request: SearchRequest):
    """
    Search through chat history with advanced filters.
    
    - **query**: Search query string
    - **filters**: Optional filters (role, type, date range, language)
    - **limit**: Maximum number of results (default: 50)
    - **offset**: Pagination offset (default: 0)
    """
    try:
        from ...services.search_service import SearchQuery
        
        search_query = SearchQuery(
            query=request.query,
            filters=request.filters,
            limit=request.limit,
            offset=request.offset
        )
        
        result = search_service.search(search_query)
        
        return {
            "success": True,
            "results": [
                {
                    "id": r.id,
                    "content": r.content,
                    "role": r.role,
                    "timestamp": r.timestamp.isoformat(),
                    "type": r.type,
                    "score": r.score,
                    "highlights": r.highlights
                }
                for r in result.results
            ],
            "total": result.total,
            "query": result.query,
            "message": result.message
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing search: {str(e)}"
        )


@router.post("/index")
async def index_message(request: IndexMessageRequest):
    """
    Index a new message for search.
    
    - **id**: Message ID
    - **content**: Message content
    - **role**: Message role (user/assistant)
    - **timestamp**: ISO timestamp
    - **type**: Message type (text/image/screen)
    - **language**: Message language (optional)
    """
    try:
        message = {
            "id": request.id,
            "content": request.content,
            "role": request.role,
            "timestamp": request.timestamp,
            "type": request.type,
            "language": request.language
        }
        
        search_service.index_message(message)
        
        return {
            "success": True,
            "message": "Message indexed successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error indexing message: {str(e)}"
        )


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1, description="Partial search query"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum suggestions")
):
    """
    Get search suggestions based on partial query.
    
    - **q**: Partial search query
    - **limit**: Maximum number of suggestions
    """
    try:
        suggestions = search_service.get_search_suggestions(q, limit)
        
        return {
            "success": True,
            "suggestions": suggestions,
            "query": q
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting suggestions: {str(e)}"
        )


@router.get("/popular")
async def get_popular_searches(
    limit: int = Query(default=10, ge=1, le=50, description="Maximum popular searches")
):
    """
    Get most popular search terms.
    
    - **limit**: Maximum number of popular searches
    """
    try:
        popular = search_service.get_popular_searches(limit)
        
        return {
            "success": True,
            "popular_searches": popular
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting popular searches: {str(e)}"
        )


@router.get("/stats")
async def get_search_stats():
    """Get search statistics."""
    try:
        total_messages = len(search_service.messages)
        total_indexed_words = len(search_service.search_index)
        
        # Count by role
        role_counts = {}
        type_counts = {}
        
        for message in search_service.messages:
            role = message.get('role', 'unknown')
            type_ = message.get('type', 'text')
            
            role_counts[role] = role_counts.get(role, 0) + 1
            type_counts[type_] = type_counts.get(type_, 0) + 1
        
        return {
            "success": True,
            "stats": {
                "total_messages": total_messages,
                "indexed_words": total_indexed_words,
                "role_distribution": role_counts,
                "type_distribution": type_counts
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting search stats: {str(e)}"
        )
