import asyncio
import json
import websockets
from typing import Dict, Optional
from ..core.config import settings


class WebSocketService:
    def __init__(self):
        self.active_connections: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.heygen_websockets: Dict[str, websockets.WebSocketClientProtocol] = {}
    
    async def connect_client(self, websocket: websockets.WebSocketServerProtocol, session_id: str):
        """Connect a client WebSocket."""
        self.active_connections[session_id] = websocket
        print(f"Client connected for session: {session_id}")
    
    async def disconnect_client(self, session_id: str):
        """Disconnect a client WebSocket."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            print(f"Client disconnected for session: {session_id}")
    
    async def connect_to_heygen(self, session_id: str, websocket_url: str) -> bool:
        """Connect to HeyGen WebSocket for streaming."""
        try:
            # Connect to HeyGen WebSocket
            heygen_ws = await websockets.connect(
                websocket_url,
                extra_headers={
                    "Authorization": f"Bearer {settings.heygen_api_key}"
                }
            )
            
            self.heygen_websockets[session_id] = heygen_ws
            
            # Start listening for messages from HeyGen
            asyncio.create_task(self._listen_to_heygen(session_id, heygen_ws))
            
            return True
            
        except Exception as e:
            print(f"Failed to connect to HeyGen WebSocket: {e}")
            return False
    
    async def _listen_to_heygen(self, session_id: str, heygen_ws: websockets.WebSocketClientProtocol):
        """Listen for messages from HeyGen and forward to client."""
        try:
            async for message in heygen_ws:
                # Forward message to client if connected
                if session_id in self.active_connections:
                    client_ws = self.active_connections[session_id]
                    try:
                        await client_ws.send(message)
                    except websockets.exceptions.ConnectionClosed:
                        await self.disconnect_client(session_id)
                        break
                        
        except websockets.exceptions.ConnectionClosed:
            print(f"HeyGen WebSocket closed for session: {session_id}")
        except Exception as e:
            print(f"Error listening to HeyGen: {e}")
        finally:
            if session_id in self.heygen_websockets:
                del self.heygen_websockets[session_id]
    
    async def send_to_heygen(self, session_id: str, message: dict) -> bool:
        """Send message to HeyGen WebSocket."""
        if session_id not in self.heygen_websockets:
            return False
        
        try:
            heygen_ws = self.heygen_websockets[session_id]
            await heygen_ws.send(json.dumps(message))
            return True
            
        except Exception as e:
            print(f"Error sending to HeyGen: {e}")
            return False
    
    async def broadcast_to_client(self, session_id: str, message: dict):
        """Send message to client WebSocket."""
        if session_id in self.active_connections:
            client_ws = self.active_connections[session_id]
            try:
                await client_ws.send(json.dumps(message))
            except websockets.exceptions.ConnectionClosed:
                await self.disconnect_client(session_id)
    
    async def cleanup_session(self, session_id: str):
        """Clean up session connections."""
        # Disconnect client
        await self.disconnect_client(session_id)
        
        # Close HeyGen WebSocket
        if session_id in self.heygen_websockets:
            try:
                await self.heygen_websockets[session_id].close()
            except:
                pass
            del self.heygen_websockets[session_id]


# Singleton instance
websocket_service = WebSocketService()
