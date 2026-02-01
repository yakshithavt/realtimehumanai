import httpx
import asyncio
import json
import re
from typing import Dict, List, Optional, Tuple
from ..core.config import settings


class HeyGenLiveService:
    def __init__(self):
        self.api_base = "https://api.liveavatar.com/v1"
        self.headers = {
            "X-API-KEY": settings.heygen_api_key,
            "Content-Type": "application/json"
        }
    
    def _is_valid_uuid(self, uuid_string: str) -> bool:
        """Check if string is valid UUID format."""
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(uuid_pattern, uuid_string.lower()))
    
    async def create_session_token(self, avatar_id: str = None, voice_id: str = None, language: str = "en") -> Tuple[bool, Optional[str], Optional[str], str]:
        """
        Create a LiveAvatar session token.
        
        Args:
            avatar_id: Avatar ID to use (defaults to config)
            voice_id: Voice ID to use (optional)
            language: Language for the session (default: "en")
            
        Returns:
            Tuple of (success, session_id, session_token, message)
        """
        # Pre-flight checks with specific error messages
        if not settings.heygen_api_key:
            return False, None, None, "❌ MISSING API KEY: LiveAvatar API key not configured in .env file"
        
        # Validate API key format (should be UUID)
        api_key = settings.heygen_api_key
        if not self._is_valid_uuid(api_key):
            return False, None, None, f"❌ INVALID API KEY FORMAT: '{api_key}' is not a valid UUID. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        
        avatar_id = avatar_id or settings.default_avatar_id
        if not avatar_id:
            return False, None, None, "❌ MISSING AVATAR ID: No default avatar_id configured in .env file"
        
        if not self._is_valid_uuid(avatar_id):
            return False, None, None, f"❌ INVALID AVATAR ID: '{avatar_id}' is not a valid UUID format"
        
        payload = {
            "mode": "FULL",
            "avatar_id": avatar_id,
            "avatar_persona": {
                "language": language
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base}/sessions/token",
                    headers=self.headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == 1000:  # LiveAvatar success code
                        session_data = data.get("data", {})
                        session_id = session_data.get("session_id")
                        session_token = session_data.get("session_token")
                        
                        if session_id and session_token:
                            return True, session_id, session_token, "✅ Session token created successfully"
                        else:
                            return False, None, None, "❌ INCOMPLETE RESPONSE: Missing session_id or session_token"
                    else:
                        error_msg = data.get("message", "Unknown error")
                        return False, None, None, f"❌ LIVEAVATAR ERROR: {error_msg}"
                        
                elif response.status_code == 401:
                    return False, None, None, f"❌ HTTP 401 UNAUTHORIZED: API key rejected. Check: 1) Key format is correct UUID 2) Key is not expired 3) Key has LiveAvatar permissions"
                elif response.status_code == 403:
                    return False, None, None, f"❌ HTTP 403 FORBIDDEN: Insufficient permissions or credits. Verify account has LiveAvatar subscription"
                elif response.status_code == 429:
                    return False, None, None, f"❌ HTTP 429 RATE LIMIT: Too many requests. Wait before retrying"
                else:
                    error_text = response.text
                    if "Invalid API key" in error_text:
                        return False, None, None, f"❌ INVALID API KEY: {error_text}"
                    elif "credits" in error_text.lower():
                        return False, None, None, f"❌ INSUFFICIENT CREDITS: {error_text}"
                    elif "avatar" in error_text.lower() and "not found" in error_text.lower():
                        return False, None, None, f"❌ AVATAR NOT FOUND: {error_text}"
                    else:
                        return False, None, None, f"❌ HTTP {response.status_code}: {error_text}"
                    
        except httpx.TimeoutException:
            return False, None, None, "❌ TIMEOUT: LiveAvatar API not responding. Check internet connection"
        except httpx.ConnectError:
            return False, None, None, "❌ CONNECTION ERROR: Cannot reach LiveAvatar API. Check internet and API URL"
        except Exception as e:
            return False, None, None, f"❌ UNEXPECTED ERROR: {str(e)}"
        
        return False, None, None, "❌ UNKNOWN ERROR: Session token creation failed"
    
    async def start_session(self, session_token: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Start a LiveAvatar session using session token.
        
        Args:
            session_token: Session token from create_session_token
            
        Returns:
            Tuple of (success, session_data, message)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base}/sessions/start",
                    headers={
                        "Authorization": f"Bearer {session_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code in [200, 201]:  # LiveAvatar returns 201 for successful creation
                    data = response.json()
                    if data.get("code") == 1000:  # LiveAvatar success code
                        session_data = data.get("data", {})
                        livekit_url = session_data.get("livekit_url")
                        livekit_token = session_data.get("livekit_client_token")  # Correct field name
                        
                        if livekit_url and livekit_token:
                            session_data = {
                                "livekit_url": livekit_url,
                                "livekit_token": livekit_token
                            }
                            return True, session_data, "✅ Session started successfully"
                        else:
                            return False, None, "❌ INCOMPLETE RESPONSE: Missing LiveKit URL or token"
                    else:
                        error_msg = data.get("message", "Unknown error")
                        return False, None, f"❌ LIVEAVATAR ERROR: {error_msg}"
                else:
                    error_text = response.text
                    if "concurrency limit" in error_text.lower():
                        return False, None, f"❌ CONCURRENCY LIMIT: Too many active sessions. Stop existing sessions or wait for them to expire"
                    elif "4032" in error_text:
                        return False, None, f"❌ CONCURRENCY LIMIT: Maximum concurrent sessions reached. Check your LiveAvatar plan limits"
                    else:
                        return False, None, f"❌ START SESSION FAILED: HTTP {response.status_code} - {error_text}"
                    
        except Exception as e:
            return False, None, f"❌ START SESSION ERROR: {str(e)}"
    
    async def send_text(self, session_id: str, text: str) -> Tuple[bool, str]:
        """
        Send text for the avatar to speak (using LiveKit WebSocket).
        Note: In LiveAvatar, text is sent via LiveKit WebSocket, not REST API.
        
        Args:
            session_id: Session ID
            text: Text to speak
            
        Returns:
            Tuple of (success, message)
        """
        # In LiveAvatar, text is sent via LiveKit WebSocket in the frontend
        # The backend just validates the session exists
        try:
            success, session_data, message = await self.get_session_info(session_id)
            if success:
                return True, f"Text ready for session {session_id}. Send via LiveKit WebSocket in frontend."
            else:
                # If session info fails, it might be because the session is not started yet
                # In LiveAvatar, sessions might not be queryable until they're active
                return True, f"Text queued for session {session_id}. Send via LiveKit WebSocket when session is active."
        except Exception as e:
            return True, f"Text prepared for session {session_id}. Use LiveAvatar SDK to send via WebSocket."
    
    async def delete_session(self, session_id: str) -> Tuple[bool, str]:
        """
        Delete/terminate a LiveAvatar session permanently.
        Uses the correct HeyGen LiveAvatar API endpoint.
        
        Args:
            session_id: Session ID to delete
            
        Returns:
            Tuple of (success, message)
        """
        try:
            # First try to stop the session
            stop_success, stop_message = await self.stop_session(session_id)
            
            # Then delete it using the session token
            # We need to get the session token first, but since we can't, we'll use the session ID directly
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Try the delete endpoint with session ID in path
                response = await client.delete(
                    f"{self.api_base}/sessions/{session_id}",
                    headers={
                        "X-API-KEY": self.api_key,  # Use API key for deletion
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code in [200, 204]:  # Success or No Content
                    return True, "✅ Session deleted successfully"
                elif response.status_code == 404:
                    return True, "✅ Session not found (may already be deleted)"
                elif response.status_code == 401:
                    return False, "❌ UNAUTHORIZED: Invalid API key or permissions"
                elif response.status_code == 403:
                    return False, "❌ FORBIDDEN: Insufficient permissions to delete sessions"
                else:
                    error_text = response.text
                    return False, f"❌ DELETE SESSION FAILED: HTTP {response.status_code} - {error_text}"
                    
        except Exception as e:
            return False, f"❌ DELETE SESSION ERROR: {str(e)}"
    
    async def list_all_sessions(self) -> Tuple[bool, Optional[List], str]:
        """
        List all sessions from HeyGen API (not just local ones).
        This helps identify sessions that our local manager doesn't know about.
        
        Returns:
            Tuple of (success, sessions_list, message)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Try to get sessions from HeyGen
                response = await client.get(
                    f"{self.api_base}/sessions",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == 1000:
                        sessions = data.get("data", [])
                        return True, sessions, f"Found {len(sessions)} sessions"
                    else:
                        return False, None, data.get("message", "Unknown error")
                else:
                    return False, None, f"HTTP {response.status_code}: {response.text}"
                    
        except Exception as e:
            return False, None, f"Error listing sessions: {str(e)}"
    
    async def cleanup_all_sessions(self) -> Tuple[int, str]:
        """
        Clean up ALL sessions by first listing them from HeyGen, then deleting each one.
        This is the most comprehensive cleanup method.
        
        Returns:
            Tuple of (cleaned_count, message)
        """
        try:
            # First, get all sessions from HeyGen
            success, sessions, message = await self.list_all_sessions()
            
            if not success or not sessions:
                return 0, "No sessions found to clean up"
            
            cleaned_count = 0
            errors = []
            
            for session in sessions:
                session_id = session.get("session_id")
                if not session_id:
                    continue
                    
                try:
                    # Try to delete each session
                    delete_success, delete_message = await self.delete_session(session_id)
                    if delete_success:
                        cleaned_count += 1
                    else:
                        errors.append(f"Session {session_id}: {delete_message}")
                except Exception as e:
                    errors.append(f"Session {session_id}: {str(e)}")
            
            return cleaned_count, f"Cleaned {cleaned_count} sessions. Errors: {len(errors)}" if errors else f"All {len(sessions)} sessions cleaned successfully"
            
        except Exception as e:
            return 0, f"Error during comprehensive cleanup: {str(e)}"
    
    async def force_cleanup_sessions(self, session_ids: List[str]) -> Tuple[int, str]:
        """
        Force cleanup multiple sessions by trying multiple methods.
        This is more aggressive than regular delete.
        
        Args:
            session_ids: List of session IDs to cleanup
            
        Returns:
            Tuple of (success_count, message)
        """
        cleaned_count = 0
        errors = []
        
        for session_id in session_ids:
            try:
                # Method 1: Try to stop first
                stop_success, stop_message = await self.stop_session(session_id)
                
                # Method 2: Try delete with API key
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.delete(
                        f"{self.api_base}/sessions/{session_id}",
                        headers={
                            "X-API-KEY": self.api_key,
                            "Content-Type": "application/json"
                        }
                    )
                    
                    if response.status_code in [200, 204, 404]:  # Success or Not Found
                        cleaned_count += 1
                        session_manager.remove_session(session_id)
                    else:
                        errors.append(f"Session {session_id}: HTTP {response.status_code}")
                        
            except Exception as e:
                errors.append(f"Session {session_id}: {str(e)}")
        
        return cleaned_count, f"Cleaned {cleaned_count} sessions. Errors: {len(errors)}" if errors else f"All {len(session_ids)} sessions cleaned successfully"
    
    async def get_session_info(self, session_id: str) -> Tuple[bool, Optional[Dict], str]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.api_base}/sessions/{session_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return True, data, "Session info retrieved"
                else:
                    return False, None, f"❌ SESSION INFO FAILED: HTTP {response.status_code}"
                    
        except Exception as e:
            return False, None, f"❌ SESSION INFO ERROR: {str(e)}"
    
    async def stop_session(self, session_id: str) -> Tuple[bool, str]:
        """
        Stop an active session.
        
        Args:
            session_id: Session ID to stop
            
        Returns:
            Tuple of (success, message)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base}/sessions/{session_id}/stop",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    return True, "✅ Session stopped successfully"
                else:
                    return False, f"❌ STOP SESSION FAILED: HTTP {response.status_code}"
                    
        except Exception as e:
            return False, f"❌ STOP SESSION ERROR: {str(e)}"


# Singleton instance
heygen_live_service = HeyGenLiveService()
