from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from pathlib import Path

class StudentService:
    """Service for managing student profiles and progress"""
    
    def __init__(self):
        self.data_dir = Path("data/students")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.students_file = self.data_dir / "students.json"
        self._load_data()
    
    def _load_data(self):
        """Load student data from file"""
        if self.students_file.exists():
            try:
                with open(self.students_file, 'r') as f:
                    self.students = json.load(f)
            except:
                self.students = {}
        else:
            self.students = {}
    
    def _save_data(self):
        """Save student data to file"""
        with open(self.students_file, 'w') as f:
            json.dump(self.students, f, indent=2, default=str)
    
    async def get_student(self, student_id: str):
        """Get student by ID"""
        return self.students.get(student_id)
    
    async def create_student(self, student_data: Dict[str, Any]):
        """Create new student"""
        student_id = f"student_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        student_data['id'] = student_id
        student_data['created_at'] = datetime.now().isoformat()
        student_data['last_active'] = datetime.now().isoformat()
        
        self.students[student_id] = student_data
        self._save_data()
        return student_data
    
    async def update_student(self, student_id: str, updates: Dict[str, Any]):
        """Update student data"""
        if student_id in self.students:
            self.students[student_id].update(updates)
            self.students[student_id]['last_active'] = datetime.now().isoformat()
            self._save_data()
            return self.students[student_id]
        return None

# Singleton instance
student_service = StudentService()
