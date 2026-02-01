from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class TeachingMode(str, Enum):
    HARDWARE_LAB = "hardware_lab"
    MATH_WHITEBOARD = "math_whiteboard"
    SCIENCE_SIMULATION = "science_simulation"
    CODING_WORKSHOP = "coding_workshop"

class AvatarStyle(str, Enum):
    PROFESSIONAL_TEACHER = "professional_teacher"
    FRIENDLY_MENTOR = "friendly_mentor"
    TECHNICAL_EXPERT = "technical_expert"
    CREATIVE_INSTRUCTOR = "creative_instructor"
    PATIENT_TUTOR = "patient_tutor"
    ENERGETIC_COACH = "energetic_coach"

class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING = "reading"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class Language(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    CHINESE = "zh"
    JAPANESE = "ja"
    ARABIC = "ar"
    HINDI = "hi"
    PORTUGUESE = "pt"
    RUSSIAN = "ru"

# Student Models
class StudentProfile(BaseModel):
    id: str
    name: str
    age: Optional[int] = None
    learning_style: LearningStyle
    preferred_language: Language
    difficulty_preference: DifficultyLevel
    interests: List[str] = []
    learning_goals: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    created_at: datetime
    last_active: datetime

# Teaching Session Models
class TeachingRequest(BaseModel):
    student_id: str
    topic: str
    teaching_mode: TeachingMode
    avatar_style: AvatarStyle
    language: Language
    difficulty_level: DifficultyLevel
    specific_question: Optional[str] = None
    learning_objectives: List[str] = []
    duration_minutes: int = 30

class TeachingStep(BaseModel):
    step_number: int
    avatar_speech: str
    visual_demo: str
    highlight: str
    pause_for_student: bool
    question_to_student: Optional[str] = None
    interaction_type: str = "explanation"  # explanation, question, demonstration, practice
    estimated_time_seconds: int = 60

class TeachingLesson(BaseModel):
    id: str
    title: str
    topic: str
    teaching_mode: TeachingMode
    language: Language
    difficulty_level: DifficultyLevel
    avatar_style: AvatarStyle
    materials: List[str] = []
    steps: List[TeachingStep]
    summary: str
    next_action: str
    estimated_duration_minutes: int
    created_at: datetime

# Hardware Lab Models
class HardwareComponent(BaseModel):
    id: str
    name: str
    category: str  # resistor, capacitor, led, arduino, etc.
    specifications: Dict[str, Any]
    3d_model_url: Optional[str] = None
    description: str
    safety_notes: List[str] = []

class HardwareProject(BaseModel):
    id: str
    title: str
    description: str
    difficulty_level: DifficultyLevel
    components: List[HardwareComponent]
    tools_required: List[str]
    safety_warnings: List[str]
    steps: List[TeachingStep]
    learning_objectives: List[str]

# Mathematics Models
class MathProblem(BaseModel):
    id: str
    topic: str
    problem_statement: str
    problem_type: str  # algebra, geometry, calculus, etc.
    difficulty_level: DifficultyLevel
    solution_steps: List[TeachingStep]
    answer: str
    explanation: str

# Science Simulation Models
class ScienceExperiment(BaseModel):
    id: str
    title: str
    subject: str  # physics, chemistry, biology
    topic: str
    difficulty_level: DifficultyLevel
    materials: List[str]
    safety_precautions: List[str]
    procedure: List[TeachingStep]
    expected_results: str
    scientific_principles: List[str]

# Coding Workshop Models
class CodingExercise(BaseModel):
    id: str
    title: str
    programming_language: str
    difficulty_level: DifficultyLevel
    description: str
    starter_code: str
    solution_code: str
    explanation: str
    learning_objectives: List[str]
    hints: List[str]

# Avatar System Models
class AvatarConfiguration(BaseModel):
    style: AvatarStyle
    voice_tone: str
    speech_rate: float
    language: Language
    appearance: Dict[str, Any]
    personality_traits: List[str]

class AvatarResponse(BaseModel):
    speech: str
    gestures: List[str]
    facial_expressions: List[str]
    emotions: List[str]
    visual_elements: List[Dict[str, Any]]

# Analytics Models
class LearningProgress(BaseModel):
    student_id: str
    topic: str
    mastery_level: float  # 0.0 to 1.0
    time_spent_minutes: int
    completion_rate: float
    strengths_demonstrated: List[str]
    areas_for_improvement: List[str]
    last_updated: datetime

class SessionAnalytics(BaseModel):
    session_id: str
    student_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    teaching_mode: TeachingMode
    topic: str
    engagement_score: float
    questions_asked: int
    correct_answers: int
    help_requested: int
    completion_status: str

# API Response Models
class TeachingResponse(BaseModel):
    success: bool
    lesson: Optional[TeachingLesson] = None
    avatar_response: Optional[AvatarResponse] = None
    message: str
    session_id: str
    next_step_suggestion: Optional[str] = None

class ProgressResponse(BaseModel):
    success: bool
    progress_data: Optional[LearningProgress] = None
    analytics: Optional[SessionAnalytics] = None
    recommendations: List[str] = []
    message: str

# Multi-language Support Models
class TranslationRequest(BaseModel):
    text: str
    target_language: Language
    source_language: Optional[Language] = None

class TranslationResponse(BaseModel):
    success: bool
    translated_text: str
    source_language: Language
    target_language: Language
    confidence: float

# Accessibility Models
class AccessibilitySettings(BaseModel):
    screen_reader_enabled: bool = False
    high_contrast_mode: bool = False
    font_size_multiplier: float = 1.0
    closed_captions_enabled: bool = True
    voice_commands_enabled: bool = False
    haptic_feedback_enabled: bool = False
    simplified_interface: bool = False
