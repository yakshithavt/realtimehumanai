import httpx
from typing import List, Optional, Tuple
from ..core.config import settings


class SessionManager:
    def __init__(self):
        self.active_sessions = set()
    
    def add_session(self, session_id: str):
        """Add a session to the active sessions list."""
        self.active_sessions.add(session_id)
        print(f"📋 Added session {session_id} to active sessions")
    
    def remove_session(self, session_id: str) -> bool:
        """Remove a session from the active sessions list."""
        if session_id in self.active_sessions:
            self.active_sessions.remove(session_id)
            print(f"🗑️ Removed session {session_id} from active sessions")
            return True
        return False
    
    def get_active_sessions(self) -> List[str]:
        """Get list of all active sessions."""
        return list(self.active_sessions)
    
    def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions (placeholder for future implementation)."""
        # This would check session age and remove old ones
        return 0  # Placeholder
    
    async def stop_all_sessions(self) -> Tuple[int, str]:
        """Stop all active sessions."""
        stopped_count = 0
        errors = []
        
        for session_id in list(self.active_sessions):
            try:
                success, message = await self.stop_session(session_id)
                if success:
                    stopped_count += 1
                    self.remove_session(session_id)
                else:
                    errors.append(f"Session {session_id}: {message}")
            except Exception as e:
                errors.append(f"Session {session_id}: {str(e)}")
        
        return stopped_count, f"Stopped {stopped_count} sessions. Errors: {len(errors)}" if errors else "All sessions stopped successfully"


# Singleton instance
session_manager = SessionManager()
