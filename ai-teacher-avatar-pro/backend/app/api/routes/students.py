from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel

from ..services.student_management import student_service

class StudentCreateRequest(BaseModel):
    name: str
    age: int
    learning_style: str
    preferred_language: str
    difficulty_preference: str
    interests: List[str] = []

@router.post("/create")
async def create_student(student_data: StudentCreateRequest):
    """Create a new student profile"""
    try:
        student = await student_service.create_student(student_data.dict())
        return {
            "success": True,
            "student": student,
            "message": "Student created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating student: {str(e)}")

@router.get("/{student_id}")
async def get_student(student_id: str):
    """Get student by ID"""
    try:
        student = await student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return {
            "success": True,
            "student": student
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting student: {str(e)}")

@router.get("/")
async def list_students():
    """List all students"""
    try:
        students = list(student_service.students.values())
        return {
            "success": True,
            "students": students,
            "total": len(students)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing students: {str(e)}")

router = APIRouter(prefix="/students", tags=["Students"])
