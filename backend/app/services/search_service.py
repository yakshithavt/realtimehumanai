from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import re
import json
from pathlib import Path


class SearchQuery(BaseModel):
    """Search query model."""
    query: str
    filters: Optional[Dict[str, Any]] = {}
    limit: int = 50
    offset: int = 0


class SearchResult(BaseModel):
    """Search result model."""
    id: str
    content: str
    role: str
    timestamp: datetime
    type: str
    score: float
    highlights: List[str]


class SearchResponse(BaseModel):
    """Search response model."""
    success: bool
    results: List[SearchResult]
    total: int
    query: str
    message: str


class SearchService:
    """Advanced search service for chat history and content."""
    
    def __init__(self):
        self.data_dir = Path("data/search")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.messages_file = self.data_dir / "messages.json"
        self.index_file = self.data_dir / "search_index.json"
        self._load_data()
    
    def _load_data(self):
        """Load existing messages and build search index."""
        if self.messages_file.exists():
            try:
                with open(self.messages_file, 'r') as f:
                    self.messages = json.load(f)
            except:
                self.messages = []
        else:
            self.messages = []
        
        self._build_search_index()
    
    def _save_data(self):
        """Save messages to file."""
        with open(self.messages_file, 'w') as f:
            json.dump(self.messages, f, indent=2, default=str)
    
    def _build_search_index(self):
        """Build search index for faster searching."""
        self.search_index = {}
        
        for i, message in enumerate(self.messages):
            # Index words from content
            words = re.findall(r'\b\w+\b', message['content'].lower())
            
            for word in words:
                if word not in self.search_index:
                    self.search_index[word] = []
                
                self.search_index[word].append({
                    'message_id': message['id'],
                    'position': i,
                    'word_positions': [j for j, w in enumerate(re.findall(r'\b\w+\b', message['content'].lower())) if w == word]
                })
    
    def index_message(self, message: Dict[str, Any]):
        """Add a message to the search index."""
        # Add to messages list
        self.messages.append(message)
        
        # Update search index
        words = re.findall(r'\b\w+\b', message['content'].lower())
        
        for word in words:
            if word not in self.search_index:
                self.search_index[word] = []
            
            self.search_index[word].append({
                'message_id': message['id'],
                'position': len(self.messages) - 1,
                'word_positions': [j for j, w in enumerate(re.findall(r'\b\w+\b', message['content'].lower())) if w == word]
            })
        
        self._save_data()
    
    def search(self, search_query: SearchQuery) -> SearchResponse:
        """Perform advanced search with filters."""
        query = search_query.query.lower()
        filters = search_query.filters or {}
        limit = search_query.limit
        offset = search_query.offset
        
        # Get matching message IDs from search index
        matching_ids = set()
        
        # Split query into words
        query_words = query.split()
        
        for word in query_words:
            if word in self.search_index:
                for match in self.search_index[word]:
                    matching_ids.add(match['message_id'])
        
        # Get full messages
        results = []
        for message in self.messages:
            if message['id'] in matching_ids:
                # Apply filters
                if self._passes_filters(message, filters):
                    # Calculate relevance score
                    score = self._calculate_score(message, query_words)
                    
                    # Generate highlights
                    highlights = self._generate_highlights(message['content'], query_words)
                    
                    result = SearchResult(
                        id=message['id'],
                        content=message['content'],
                        role=message['role'],
                        timestamp=datetime.fromisoformat(message['timestamp']),
                        type=message.get('type', 'text'),
                        score=score,
                        highlights=highlights
                    )
                    results.append(result)
        
        # Sort by relevance score
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Apply pagination
        total = len(results)
        paginated_results = results[offset:offset + limit]
        
        return SearchResponse(
            success=True,
            results=paginated_results,
            total=total,
            query=search_query.query,
            message=f"Found {total} results for '{search_query.query}'"
        )
    
    def _passes_filters(self, message: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """Check if message passes all filters."""
        # Role filter
        if 'role' in filters and message['role'] != filters['role']:
            return False
        
        # Type filter
        if 'type' in filters and message.get('type') != filters['type']:
            return False
        
        # Date range filter
        if 'date_from' in filters:
            date_from = datetime.fromisoformat(filters['date_from'])
            message_date = datetime.fromisoformat(message['timestamp'])
            if message_date < date_from:
                return False
        
        if 'date_to' in filters:
            date_to = datetime.fromisoformat(filters['date_to'])
            message_date = datetime.fromisoformat(message['timestamp'])
            if message_date > date_to:
                return False
        
        # Language filter
        if 'language' in filters and message.get('language') != filters['language']:
            return False
        
        return True
    
    def _calculate_score(self, message: Dict[str, Any], query_words: List[str]) -> float:
        """Calculate relevance score for a message."""
        content = message['content'].lower()
        score = 0.0
        
        # Exact phrase match gets highest score
        if ' '.join(query_words) in content:
            score += 10.0
        
        # Individual word matches
        for word in query_words:
            word_count = content.count(word)
            score += word_count * 2.0
        
        # Boost for recent messages
        message_date = datetime.fromisoformat(message['timestamp'])
        days_ago = (datetime.now() - message_date).days
        recency_boost = max(0, 1.0 - (days_ago / 30.0))  # Decay over 30 days
        score += recency_boost
        
        # Boost for assistant messages (often more valuable)
        if message['role'] == 'assistant':
            score += 1.0
        
        return score
    
    def _generate_highlights(self, content: str, query_words: List[str]) -> List[str]:
        """Generate highlighted snippets around search terms."""
        highlights = []
        content_lower = content.lower()
        
        for word in query_words:
            # Find all occurrences of the word
            start = 0
            while True:
                pos = content_lower.find(word, start)
                if pos == -1:
                    break
                
                # Get context around the word (50 chars before and after)
                start_pos = max(0, pos - 50)
                end_pos = min(len(content), pos + len(word) + 50)
                snippet = content[start_pos:end_pos]
                
                # Add ellipsis if needed
                if start_pos > 0:
                    snippet = '...' + snippet
                if end_pos < len(content):
                    snippet = snippet + '...'
                
                highlights.append(snippet)
                start = pos + 1
        
        # Remove duplicates and limit to 3 highlights
        return list(dict.fromkeys(highlights))[:3]
    
    def get_search_suggestions(self, query: str, limit: int = 10) -> List[str]:
        """Get search suggestions based on partial query."""
        if len(query) < 2:
            return []
        
        query_lower = query.lower()
        suggestions = set()
        
        # Look for words that start with the query
        for word in self.search_index:
            if word.startswith(query_lower):
                suggestions.add(word)
        
        # Also look for words that contain the query
        for word in self.search_index:
            if query_lower in word and not word.startswith(query_lower):
                suggestions.add(word)
        
        return sorted(list(suggestions))[:limit]
    
    def get_popular_searches(self, limit: int = 10) -> List[str]:
        """Get most popular search terms."""
        # This would typically track actual searches, but for now return common words
        word_counts = {}
        for word, matches in self.search_index.items():
            word_counts[word] = len(matches)
        
        return sorted(word_counts.keys(), key=lambda x: word_counts[x], reverse=True)[:limit]


# Singleton instance
search_service = SearchService()
