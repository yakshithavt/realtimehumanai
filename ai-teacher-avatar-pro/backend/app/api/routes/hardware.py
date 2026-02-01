from fastapi import APIRouter
from typing import Dict, Any

@router.get("/components")
async def get_hardware_components():
    """Get available hardware components"""
    return {
        "success": True,
        "components": [
            {
                "id": "arduino_uno",
                "name": "Arduino Uno",
                "category": "microcontroller",
                "description": "Popular microcontroller for beginners",
                "specifications": {
                    "digital_pins": 14,
                    "analog_pins": 6,
                    "flash_memory": "32KB",
                    "clock_speed": "16MHz"
                }
            },
            {
                "id": "led_red_5mm",
                "name": "LED Red 5mm",
                "category": "led",
                "description": "Standard red LED for projects",
                "specifications": {
                    "voltage": "2V",
                    "current": "20mA",
                    "wavelength": "620-625nm"
                }
            },
            {
                "id": "resistor_220_ohm",
                "name": "220Ω Resistor",
                "category": "resistor",
                "description": "Standard resistor for LED circuits",
                "specifications": {
                    "resistance": "220Ω",
                    "tolerance": "5%",
                    "power_rating": "0.25W"
                }
            }
        ]
    }

@router.get("/projects")
async def get_hardware_projects():
    """Get available hardware projects"""
    return {
        "success": True,
        "projects": [
            {
                "id": "led_blink",
                "name": "LED Blink Circuit",
                "difficulty": "beginner",
                "description": "Basic LED blinking with Arduino",
                "components": ["arduino_uno", "led_red_5mm", "resistor_220_ohm", "breadboard", "jumper_wires"],
                "estimated_time": 30
            },
            {
                "id": "traffic_light",
                "name": "Traffic Light Simulator",
                "difficulty": "intermediate",
                "description": "RGB traffic light with timing control",
                "components": ["arduino_uno", "led_red_5mm", "led_yellow_5mm", "led_green_5mm", "resistors"],
                "estimated_time": 45
            }
        ]
    }

router = APIRouter(prefix="/hardware", tags=["Hardware"])
