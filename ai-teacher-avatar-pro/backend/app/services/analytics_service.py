from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from pathlib import Path

class AnalyticsService:
    """Service for tracking learning analytics and progress"""
    
    def __init__(self):
        self.data_dir = Path("data/analytics")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.sessions_file = self.data_dir / "sessions.json"
        self.progress_file = self.data_dir / "progress.json"
        self._load_data()
    
    def _load_data(self):
        """Load analytics data from files"""
        if self.sessions_file.exists():
            try:
                with open(self.sessions_file, 'r') as f:
                    self.sessions = json.load(f)
            except:
                self.sessions = {}
        else:
            self.sessions = {}
        
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    self.progress = json.load(f)
            except:
                self.progress = {}
        else:
            self.progress = {}
    
    def _save_data(self):
        """Save analytics data to files"""
        with open(self.sessions_file, 'w') as f:
            json.dump(self.sessions, f, indent=2, default=str)
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2, default=str)
    
    async def create_session(self, session_data: Dict[str, Any]):
        """Create new session"""
        session_id = session_data.get('session_id')
        if session_id:
            self.sessions[session_id] = session_data
            self._save_data()
    
    async def update_session(self, session_id: str, updates: Dict[str, Any]):
        """Update session data"""
        if session_id in self.sessions:
            self.sessions[session_id].update(updates)
            self._save_data()
    
    async def get_session(self, session_id: str):
        """Get session by ID"""
        return self.sessions.get(session_id)
    
    async def complete_session(self, session_id: str):
        """Mark session as completed"""
        if session_id in self.sessions:
            self.sessions[session_id]['end_time'] = datetime.now().isoformat()
            self.sessions[session_id]['completion_status'] = 'completed'
            self._save_data()
    
    async def update_progress(self, progress_data: Dict[str, Any]):
        """Update student progress"""
        student_id = progress_data.get('student_id')
        topic = progress_data.get('topic')
        
        if student_id and topic:
            key = f"{student_id}_{topic}"
            self.progress[key] = progress_data
            self._save_data()
    
    async def get_student_progress(self, student_id: str):
        """Get all progress for a student"""
        student_progress = []
        for key, data in self.progress.items():
            if key.startswith(f"{student_id}_"):
                student_progress.append(data)
        return student_progress

# Singleton instance
analytics_service = AnalyticsService()
