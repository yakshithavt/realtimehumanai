import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from ...services.websocket_service import websocket_service
from ...services.heygen_live_service import heygen_live_service


router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/live-avatar/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for LiveAvatar streaming."""
    await websocket.accept()
    
    try:
        # Connect client WebSocket
        await websocket_service.connect_client(websocket, session_id)
        
        # Get session info to get WebSocket URL
        success, session_data, message = await heygen_live_service.get_session_info(session_id)
        
        if not success or not session_data:
            await websocket.send_json({
                "type": "error",
                "message": f"Failed to get session info: {message}"
            })
            return
        
        # Extract WebSocket URL from session data
        websocket_url = session_data.get("websocket_url")
        if not websocket_url:
            await websocket.send_json({
                "type": "error", 
                "message": "No WebSocket URL in session data"
            })
            return
        
        # Connect to HeyGen WebSocket
        heygen_connected = await websocket_service.connect_to_heygen(session_id, websocket_url)
        
        if not heygen_connected:
            await websocket.send_json({
                "type": "error",
                "message": "Failed to connect to HeyGen WebSocket"
            })
            return
        
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to LiveAvatar streaming"
        })
        
        # Listen for messages from client
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "speak":
                    text = message.get("text", "")
                    if text:
                        # Send text to HeyGen via REST API
                        success, response_message = await heygen_live_service.send_text(session_id, text)
                        
                        await websocket.send_json({
                            "type": "speak_response",
                            "success": success,
                            "message": response_message
                        })
                
                elif message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": asyncio.get_event_loop().time()
                    })
                
                elif message.get("type") == "stop":
                    # Stop the session
                    await heygen_live_service.stop_session(session_id)
                    await websocket.send_json({
                        "type": "stopped",
                        "message": "Session stopped"
                    })
                    break
                    
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Error processing message: {str(e)}"
                })
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Cleanup connections
        await websocket_service.cleanup_session(session_id)
