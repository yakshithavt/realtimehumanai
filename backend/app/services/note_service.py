from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
from pathlib import Path

class Note(BaseModel):
    """Note model for saving important AI responses."""
    id: str
    title: str
    content: str
    source_type: str  # 'chat', 'vision', 'screen', 'file'
    source_content: Optional[str] = None
    tags: List[str] = []
    category: Optional[str] = None
    is_favorite: bool = False
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}

class CreateNoteRequest(BaseModel):
    """Request model for creating a note."""
    title: str
    content: str
    source_type: str
    source_content: Optional[str] = None
    tags: List[str] = []
    category: Optional[str] = None

class UpdateNoteRequest(BaseModel):
    """Request model for updating a note."""
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    is_favorite: Optional[bool] = None

class NoteService:
    """Service for managing user notes."""
    
    def __init__(self):
        self.data_dir = Path("data/notes")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.notes_file = self.data_dir / "notes.json"
        self.categories_file = self.data_dir / "categories.json"
        self._load_data()
    
    def _load_data(self):
        """Load existing notes and categories."""
        if self.notes_file.exists():
            try:
                with open(self.notes_file, 'r') as f:
                    notes_data = json.load(f)
                    self.notes = [Note(**note) for note in notes_data]
            except:
                self.notes = []
        else:
            self.notes = []
        
        if self.categories_file.exists():
            try:
                with open(self.categories_file, 'r') as f:
                    self.categories = json.load(f)
            except:
                self.categories = ["General", "Important", "Research", "Ideas", "Tasks"]
        else:
            self.categories = ["General", "Important", "Research", "Ideas", "Tasks"]
    
    def _save_data(self):
        """Save notes and categories to files."""
        with open(self.notes_file, 'w') as f:
            json.dump([note.dict() for note in self.notes], f, indent=2, default=str)
        
        with open(self.categories_file, 'w') as f:
            json.dump(self.categories, f, indent=2)
    
    def create_note(self, request: CreateNoteRequest) -> Note:
        """Create a new note."""
        note = Note(
            id=str(uuid.uuid4()),
            title=request.title,
            content=request.content,
            source_type=request.source_type,
            source_content=request.source_content,
            tags=request.tags,
            category=request.category or "General",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={}
        )
        
        self.notes.append(note)
        self._save_data()
        return note
    
    def get_note(self, note_id: str) -> Optional[Note]:
        """Get a note by ID."""
        for note in self.notes:
            if note.id == note_id:
                return note
        return None
    
    def update_note(self, note_id: str, request: UpdateNoteRequest) -> Optional[Note]:
        """Update an existing note."""
        note = self.get_note(note_id)
        if not note:
            return None
        
        if request.title is not None:
            note.title = request.title
        if request.content is not None:
            note.content = request.content
        if request.tags is not None:
            note.tags = request.tags
        if request.category is not None:
            note.category = request.category
        if request.is_favorite is not None:
            note.is_favorite = request.is_favorite
        
        note.updated_at = datetime.now()
        self._save_data()
        return note
    
    def delete_note(self, note_id: str) -> bool:
        """Delete a note."""
        for i, note in enumerate(self.notes):
            if note.id == note_id:
                del self.notes[i]
                self._save_data()
                return True
        return False
    
    def list_notes(self, 
                  category: Optional[str] = None,
                  tags: Optional[List[str]] = None,
                  source_type: Optional[str] = None,
                  is_favorite: Optional[bool] = None,
                  limit: int = 50,
                  offset: int = 0) -> List[Note]:
        """List notes with optional filters."""
        filtered_notes = self.notes
        
        if category:
            filtered_notes = [n for n in filtered_notes if n.category == category]
        
        if tags:
            filtered_notes = [n for n in filtered_notes if any(tag in n.tags for tag in tags)]
        
        if source_type:
            filtered_notes = [n for n in filtered_notes if n.source_type == source_type]
        
        if is_favorite is not None:
            filtered_notes = [n for n in filtered_notes if n.is_favorite == is_favorite]
        
        # Sort by updated_at descending
        filtered_notes.sort(key=lambda x: x.updated_at, reverse=True)
        
        return filtered_notes[offset:offset + limit]
    
    def search_notes(self, query: str) -> List[Note]:
        """Search notes by title, content, or tags."""
        query_lower = query.lower()
        results = []
        
        for note in self.notes:
            if (query_lower in note.title.lower() or 
                query_lower in note.content.lower() or
                any(query_lower in tag.lower() for tag in note.tags)):
                results.append(note)
        
        # Sort by relevance (exact title matches first)
        results.sort(key=lambda x: (
            query_lower in x.title.lower(),
            x.updated_at
        ), reverse=True)
        
        return results
    
    def get_categories(self) -> List[str]:
        """Get all categories."""
        return self.categories
    
    def add_category(self, category: str) -> bool:
        """Add a new category."""
        if category not in self.categories:
            self.categories.append(category)
            self._save_data()
            return True
        return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get note statistics."""
        total_notes = len(self.notes)
        favorite_notes = len([n for n in self.notes if n.is_favorite])
        
        # Count by category
        category_counts = {}
        for note in self.notes:
            category_counts[note.category] = category_counts.get(note.category, 0) + 1
        
        # Count by source type
        source_counts = {}
        for note in self.notes:
            source_counts[note.source_type] = source_counts.get(note.source_type, 0) + 1
        
        # Get all tags
        all_tags = set()
        for note in self.notes:
            all_tags.update(note.tags)
        
        return {
            "total_notes": total_notes,
            "favorite_notes": favorite_notes,
            "categories": category_counts,
            "source_types": source_counts,
            "total_tags": len(all_tags),
            "recent_notes": len([n for n in self.notes if (datetime.now() - n.updated_at).days <= 7])
        }


# Singleton instance
note_service = NoteService()
