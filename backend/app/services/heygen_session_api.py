import httpx
from typing import List, Dict, Tuple, Optional
from ..core.config import settings


class HeyGenSessionAPI:
    """Direct HeyGen Session API client for aggressive session management."""
    
    def __init__(self):
        self.api_base = "https://api.liveavatar.com/v1"
        self.headers = {
            "X-API-KEY": settings.heygen_api_key,
            "Content-Type": "application/json"
        }
    
    async def get_all_sessions_paginated(self) -> Tuple[bool, List[Dict], str]:
        """
        Get all sessions with pagination support.
        HeyGen API might use pagination for large session lists.
        """
        all_sessions = []
        page = 1
        page_size = 50
        
        while True:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(
                        f"{self.api_base}/sessions",
                        headers=self.headers,
                        params={"page": page, "page_size": page_size}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("code") == 1000:
                            sessions = data.get("data", [])
                            all_sessions.extend(sessions)
                            
                            # Check if there are more pages
                            if len(sessions) < page_size:
                                break
                            page += 1
                        else:
                            return False, all_sessions, data.get("message", "API error")
                    else:
                        return False, all_sessions, f"HTTP {response.status_code}: {response.text}"
                        
            except Exception as e:
                return False, all_sessions, f"Error: {str(e)}"
        
        return True, all_sessions, f"Found {len(all_sessions)} total sessions"
    
    async def terminate_session_by_id(self, session_id: str) -> Tuple[bool, str]:
        """
        Terminate a session using multiple methods.
        """
        try:
            # Method 1: DELETE endpoint
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.delete(
                    f"{self.api_base}/sessions/{session_id}",
                    headers=self.headers
                )
                
                if response.status_code in [200, 204]:
                    return True, f"✅ Session {session_id} terminated"
                elif response.status_code == 404:
                    return True, f"✅ Session {session_id} not found (already terminated)"
                else:
                    return False, f"❌ DELETE failed: HTTP {response.status_code}"
                    
        except Exception as e:
            return False, f"❌ Error terminating session {session_id}: {str(e)}"
    
    async def terminate_all_sessions(self, session_ids: List[str]) -> Tuple[int, List[str], str]:
        """
        Terminate multiple sessions and return results.
        """
        terminated_count = 0
        terminated_ids = []
        errors = []
        
        for session_id in session_ids:
            success, message = await self.terminate_session_by_id(session_id)
            if success:
                terminated_count += 1
                terminated_ids.append(session_id)
            else:
                errors.append(f"{session_id}: {message}")
        
        return terminated_count, terminated_ids, f"Terminated {terminated_count} sessions. Errors: {len(errors)}" if errors else f"All {len(session_ids)} sessions terminated"
    
    async def get_session_info(self, session_id: str) -> Tuple[bool, Optional[Dict], str]:
        """
        Get detailed information about a specific session.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_base}/sessions/{session_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == 1000:
                        return True, data.get("data"), "Session info retrieved"
                    else:
                        return False, None, data.get("message", "API error")
                else:
                    return False, None, f"HTTP {response.status_code}: {response.text}"
                    
        except Exception as e:
            return False, None, f"Error getting session info: {str(e)}"


# Singleton instance
heygen_session_api = HeyGenSessionAPI()
