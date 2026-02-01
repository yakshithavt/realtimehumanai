from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
from pathlib import Path


class AnalyticsEvent(BaseModel):
    """Analytics event model."""
    event_type: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    timestamp: datetime


class UsageStats(BaseModel):
    """Usage statistics model."""
    total_sessions: int
    total_messages: int
    total_images_analyzed: int
    total_files_uploaded: int
    total_screen_shares: int
    active_users_today: int
    avg_session_duration: float
    popular_modes: Dict[str, int]
    daily_activity: List[Dict[str, Any]]


class AnalyticsService:
    """Analytics service for tracking and reporting usage."""
    
    def __init__(self):
        self.data_dir = Path("data/analytics")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.events_file = self.data_dir / "events.json"
        self.stats_file = self.data_dir / "stats.json"
        self._load_events()
    
    def _load_events(self):
        """Load existing events from file."""
        if self.events_file.exists():
            try:
                with open(self.events_file, 'r') as f:
                    self.events = json.load(f)
            except:
                self.events = []
        else:
            self.events = []
    
    def _save_events(self):
        """Save events to file."""
        with open(self.events_file, 'w') as f:
            json.dump(self.events, f, indent=2, default=str)
    
    def track_event(self, event_type: str, user_id: str = None, session_id: str = None, metadata: Dict = None):
        """Track an analytics event."""
        event = AnalyticsEvent(
            event_type=event_type,
            user_id=user_id,
            session_id=session_id,
            metadata=metadata or {},
            timestamp=datetime.now()
        )
        
        self.events.append(event.dict())
        self._save_events()
    
    def get_usage_stats(self, days: int = 30) -> UsageStats:
        """Get usage statistics for the last N days."""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_events = [e for e in self.events 
                        if datetime.fromisoformat(e['timestamp']) >= cutoff_date]
        
        # Calculate stats
        session_ids = set()
        message_count = 0
        image_count = 0
        file_count = 0
        screen_count = 0
        mode_counts = {}
        daily_activity = {}
        
        for event in recent_events:
            # Track sessions
            if event.get('session_id'):
                session_ids.add(event['session_id'])
            
            # Count by event type
            event_type = event['event_type']
            if event_type == 'message_sent':
                message_count += 1
            elif event_type == 'image_analyzed':
                image_count += 1
            elif event_type == 'file_uploaded':
                file_count += 1
            elif event_type == 'screen_share_started':
                screen_count += 1
            elif event_type == 'mode_switched':
                mode = event['metadata'].get('mode', 'unknown')
                mode_counts[mode] = mode_counts.get(mode, 0) + 1
            
            # Daily activity
            date = datetime.fromisoformat(event['timestamp']).date().isoformat()
            daily_activity[date] = daily_activity.get(date, 0) + 1
        
        # Calculate daily activity trend
        daily_list = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).date().isoformat()
            daily_list.append({
                'date': date,
                'count': daily_activity.get(date, 0)
            })
        daily_list.reverse()
        
        return UsageStats(
            total_sessions=len(session_ids),
            total_messages=message_count,
            total_images_analyzed=image_count,
            total_files_uploaded=file_count,
            total_screen_shares=screen_count,
            active_users_today=len(set(e['user_id'] for e in recent_events 
                                    if e['user_id'] and 
                                    datetime.fromisoformat(e['timestamp']).date() == datetime.now().date())),
            avg_session_duration=0.0,  # Would need session start/end events
            popular_modes=mode_counts,
            daily_activity=daily_list
        )
    
    def get_real_time_stats(self) -> Dict[str, Any]:
        """Get real-time statistics."""
        now = datetime.now()
        last_hour = now - timedelta(hours=1)
        last_day = now - timedelta(days=1)
        
        recent_events = [e for e in self.events 
                        if datetime.fromisoformat(e['timestamp']) >= last_day]
        
        hourly_events = [e for e in recent_events 
                        if datetime.fromisoformat(e['timestamp']) >= last_hour]
        
        return {
            'active_sessions': len(set(e['session_id'] for e in hourly_events if e.get('session_id'))),
            'messages_last_hour': len([e for e in hourly_events if e['event_type'] == 'message_sent']),
            'images_last_hour': len([e for e in hourly_events if e['event_type'] == 'image_analyzed']),
            'total_activity_today': len(recent_events),
            'top_mode_today': self._get_top_mode_today(recent_events)
        }
    
    def _get_top_mode_today(self, events: List[Dict]) -> str:
        """Get the most popular mode today."""
        mode_counts = {}
        for event in events:
            if event['event_type'] == 'mode_switched':
                mode = event['metadata'].get('mode', 'unknown')
                mode_counts[mode] = mode_counts.get(mode, 0) + 1
        
        if mode_counts:
            return max(mode_counts, key=mode_counts.get)
        return 'chat'  # default


# Singleton instance
analytics_service = AnalyticsService()
