from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ...services.heygen_live_service import heygen_live_service
from ...core.config import settings
import httpx
import json


router = APIRouter(prefix="/diagnostics", tags=["Diagnostics"])


class DiagnosticResponse(BaseModel):
    success: bool
    checks: Dict[str, Any]
    recommendations: list[str]


@router.get("/heygen", response_model=DiagnosticResponse)
async def heygen_diagnostics():
    """
    Comprehensive HeyGen LiveAvatar diagnostics.
    Shows exactly what's wrong with your setup.
    """
    checks = {}
    recommendations = []
    overall_success = True
    
    # 1. Check API Key Configuration
    api_key = settings.heygen_api_key
    if not api_key:
        checks["api_key"] = {
            "status": "❌ MISSING",
            "value": "None",
            "issue": "API key not configured in .env file"
        }
        recommendations.append("Add HEYGEN_API_KEY to your .env file")
        overall_success = False
    else:
        # Check API key format
        if heygen_live_service._is_valid_uuid(api_key):
            checks["api_key"] = {
                "status": "✅ VALID FORMAT",
                "value": f"{api_key[:8]}...{api_key[-4:]}",  # Show partial key
                "issue": None
            }
        else:
            checks["api_key"] = {
                "status": "❌ INVALID FORMAT",
                "value": api_key,
                "issue": "API key must be UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
            }
            recommendations.append("Get a valid UUID API key from HeyGen dashboard")
            overall_success = False
    
    # 2. Check Avatar ID
    avatar_id = settings.default_avatar_id
    if not avatar_id:
        checks["avatar_id"] = {
            "status": "❌ MISSING",
            "value": "None",
            "issue": "Default avatar ID not configured"
        }
        recommendations.append("Add DEFAULT_AVATAR_ID to your .env file")
        overall_success = False
    else:
        if heygen_live_service._is_valid_uuid(avatar_id):
            checks["avatar_id"] = {
                "status": "✅ VALID FORMAT",
                "value": avatar_id,
                "issue": None
            }
        else:
            checks["avatar_id"] = {
                "status": "❌ INVALID FORMAT",
                "value": avatar_id,
                "issue": "Avatar ID must be UUID format"
            }
            recommendations.append("Use a valid avatar ID from HeyGen")
            overall_success = False
    
    # 3. Test API Connectivity
    try:
        # Test with a simple endpoint that doesn't require auth
        async with httpx.AsyncClient(timeout=10.0) as client:
            # First test basic connectivity
            try:
                response = await client.get("https://api.heygen.com/v2/health")
                if response.status_code == 200:
                    checks["api_connectivity"] = {
                        "status": "✅ REACHABLE",
                        "value": f"HTTP {response.status_code}",
                        "issue": None
                    }
                else:
                    checks["api_connectivity"] = {
                        "status": "⚠️ API RESPONDING",
                        "value": f"HTTP {response.status_code}",
                        "issue": "API reachable but health check failed"
                    }
            except:
                # Fallback to testing with auth
                response = await client.get(
                    "https://api.heygen.com/v2/streaming.info",
                    headers={"Authorization": f"Bearer {api_key}"} if api_key else {}
                )
                
                if response.status_code == 200:
                    checks["api_connectivity"] = {
                        "status": "✅ CONNECTED",
                        "value": f"HTTP {response.status_code}",
                        "issue": None
                    }
                elif response.status_code == 401:
                    checks["api_connectivity"] = {
                        "status": "❌ AUTH FAILED",
                        "value": f"HTTP {response.status_code}",
                        "issue": "API key rejected or invalid"
                    }
                    recommendations.append("Verify API key is correct and not expired")
                    overall_success = False
                else:
                    checks["api_connectivity"] = {
                        "status": "❌ ERROR",
                        "value": f"HTTP {response.status_code}",
                        "issue": response.text[:100]
                    }
                    recommendations.append("Check HeyGen API status and your internet connection")
                    overall_success = False
                
    except httpx.TimeoutException:
        checks["api_connectivity"] = {
            "status": "❌ TIMEOUT",
            "value": "No response",
            "issue": "HeyGen API not responding"
        }
        recommendations.append("Check internet connection and API URL")
        overall_success = False
    except Exception as e:
        checks["api_connectivity"] = {
            "status": "❌ CONNECTION ERROR",
            "value": str(e),
            "issue": "Cannot reach HeyGen API"
        }
        recommendations.append("Verify internet connection and firewall settings")
        overall_success = False
    
    # 4. Test Session Creation (if basic checks pass)
    if overall_success and api_key and avatar_id:
        try:
            success, session_id, session_token, message = await heygen_live_service.create_session_token()
            if success:
                checks["session_creation"] = {
                    "status": "✅ WORKING",
                    "value": f"Session: {session_id[:8]}...",
                    "issue": None
                }
                # Clean up - no need to stop session token creation
            else:
                checks["session_creation"] = {
                    "status": "❌ FAILED",
                    "value": "None",
                    "issue": message
                }
                # Parse specific issues from message
                if "UNAUTHORIZED" in message:
                    recommendations.append("API key doesn't have LiveAvatar permissions - check subscription")
                elif "CREDITS" in message:
                    recommendations.append("Add LiveAvatar streaming credits to your HeyGen account")
                elif "AVATAR NOT FOUND" in message:
                    recommendations.append("Use a valid streaming avatar ID")
                elif "CONCURRENCY LIMIT" in message:
                    recommendations.append("Stop existing LiveAvatar sessions or wait for them to expire")
                overall_success = False
                
        except Exception as e:
            checks["session_creation"] = {
                "status": "❌ ERROR",
                "value": str(e),
                "issue": "Unexpected error during session creation"
            }
            recommendations.append("Check all configuration values")
            overall_success = False
    else:
        checks["session_creation"] = {
            "status": "⏭️ SKIPPED",
            "value": "Basic checks failed",
            "issue": "Fix above issues first"
        }
    
    # 5. Environment Check
    checks["environment"] = {
        "status": "ℹ️ INFO",
        "value": {
            "api_base": heygen_live_service.api_base,
            "debug_mode": settings.debug,
            "cors_origins": settings.cors_origins_list[:3]  # Show first 3
        },
        "issue": None
    }
    
    return DiagnosticResponse(
        success=overall_success,
        checks=checks,
        recommendations=recommendations
    )


@router.get("/test-session")
async def test_session_creation():
    """
    Quick test of session creation with detailed error output.
    """
    result = await heygen_live_service.create_session()
    return {
        "success": result[0],
        "session_id": result[1],
        "detailed_message": result[2],
        "timestamp": "2024-01-01T00:00:00Z"  # Add real timestamp if needed
    }
