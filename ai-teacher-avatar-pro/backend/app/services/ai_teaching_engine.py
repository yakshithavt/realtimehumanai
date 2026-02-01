from typing import Dict, List, Optional, Any
import json
import asyncio
from datetime import datetime
import openai
import google.generativeai as genai
from anthropic import Anthropic

from ..models.teaching_models import (
    TeachingRequest, TeachingLesson, TeachingStep, AvatarResponse,
    TeachingMode, AvatarStyle, Language, DifficultyLevel
)
from ..core.config import settings

class AITeachingEngine:
    """Advanced AI Teaching Engine with multiple AI providers"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.google_model = genai.GenerativeModel(settings.GOOGLE_MODEL)
        self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        
        # Teaching prompts for different modes
        self.teaching_prompts = self._load_teaching_prompts()
        
    def _load_teaching_prompts(self) -> Dict[str, str]:
        """Load specialized prompts for different teaching modes"""
        return {
            "hardware_lab": """
            You are an expert electronics and hardware engineering teacher. 
            Create step-by-step hardware assembly instructions with safety warnings.
            Focus on practical, hands-on learning with visual demonstrations.
            Always include materials list, tools needed, and safety precautions.
            """,
            
            "math_whiteboard": """
            You are an expert mathematics teacher who makes complex concepts visual.
            Create interactive whiteboard lessons with step-by-step problem solving.
            Show equation transformations, graph plotting, and geometric constructions.
            Pause for student understanding and ask checking questions.
            """,
            
            "science_simulation": """
            You are an expert science teacher specializing in interactive simulations.
            Create detailed science experiments with physics, chemistry, or biology focus.
            Include scientific principles, safety procedures, and expected results.
            Make learning engaging and discovery-based.
            """,
            
            "coding_workshop": """
            You are an expert programming teacher and software engineer.
            Create interactive coding lessons with live examples and debugging.
            Show code writing, execution, and problem-solving techniques.
            Include best practices and real-world applications.
            """
        }
    
    async def generate_teaching_lesson(self, request: TeachingRequest) -> TeachingLesson:
        """Generate a complete interactive teaching lesson"""
        
        try:
            # Select the best AI provider based on the teaching mode
            lesson_content = await self._generate_lesson_content(request)
            
            # Generate avatar response
            avatar_response = await self._generate_avatar_response(request, lesson_content)
            
            # Create structured lesson
            lesson = TeachingLesson(
                id=f"lesson_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                title=lesson_content.get("title", f"Learning {request.topic}"),
                topic=request.topic,
                teaching_mode=request.teaching_mode,
                language=request.language,
                difficulty_level=request.difficulty_level,
                avatar_style=request.avatar_style,
                materials=lesson_content.get("materials", []),
                steps=self._parse_teaching_steps(lesson_content.get("steps", [])),
                summary=lesson_content.get("summary", ""),
                next_action=lesson_content.get("next_action", "Would you like to practice this further?"),
                estimated_duration_minutes=lesson_content.get("duration", 30),
                created_at=datetime.now()
            )
            
            return lesson
            
        except Exception as e:
            print(f"Error generating lesson: {e}")
            raise Exception(f"Failed to generate teaching lesson: {str(e)}")
    
    async def _generate_lesson_content(self, request: TeachingRequest) -> Dict[str, Any]:
        """Generate lesson content using the best AI provider"""
        
        prompt = self._build_teaching_prompt(request)
        
        # Try different AI providers based on the mode and requirements
        if request.teaching_mode == TeachingMode.HARDWARE_LAB:
            # Use GPT-4 Vision for hardware projects
            return await self._generate_with_openai(prompt, request)
        elif request.teaching_mode == TeachingMode.MATH_WHITEBOARD:
            # Use Claude for mathematical reasoning
            return await self._generate_with_anthropic(prompt, request)
        else:
            # Use Google Gemini for general teaching
            return await self._generate_with_google(prompt, request)
    
    def _build_teaching_prompt(self, request: TeachingRequest) -> str:
        """Build comprehensive teaching prompt"""
        
        base_prompt = self.teaching_prompts.get(request.teaching_mode.value, "")
        
        specific_instructions = f"""
        
        Create a complete interactive lesson for:
        - Topic: {request.topic}
        - Teaching Mode: {request.teaching_mode.value}
        - Difficulty Level: {request.difficulty_level.value}
        - Language: {request.language.value}
        - Avatar Style: {request.avatar_style.value}
        - Duration: {request.duration_minutes} minutes
        - Specific Question: {request.specific_question or "General topic overview"}
        
        Generate the response in this JSON format:
        {{
            "title": "Lesson title",
            "materials": ["list of materials needed"],
            "duration": 30,
            "steps": [
                {{
                    "step_number": 1,
                    "avatar_speech": "What the teacher says",
                    "visual_demo": "What is shown visually",
                    "highlight": "What to highlight",
                    "pause_for_student": true,
                    "question_to_student": "Check understanding question",
                    "interaction_type": "explanation",
                    "estimated_time_seconds": 60
                }}
            ],
            "summary": "Brief recap",
            "next_action": "What to do next"
        }}
        
        Make it engaging, interactive, and suitable for the specified difficulty level.
        Include practical examples and real-world applications.
        """
        
        return base_prompt + specific_instructions
    
    async def _generate_with_openai(self, prompt: str, request: TeachingRequest) -> Dict[str, Any]:
        """Generate content using OpenAI GPT-4"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert teacher creating interactive lessons."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            print(f"OpenAI generation error: {e}")
            return await self._generate_with_google(prompt, request)
    
    async def _generate_with_anthropic(self, prompt: str, request: TeachingRequest) -> Dict[str, Any]:
        """Generate content using Anthropic Claude"""
        
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.content[0].text
            return json.loads(content)
            
        except Exception as e:
            print(f"Anthropic generation error: {e}")
            return await self._generate_with_google(prompt, request)
    
    async def _generate_with_google(self, prompt: str, request: TeachingRequest) -> Dict[str, Any]:
        """Generate content using Google Gemini"""
        
        try:
            response = await self.google_model.generate_content_async(prompt)
            content = response.text
            
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\\{.*\\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback structure
                return {
                    "title": f"Learning {request.topic}",
                    "materials": [],
                    "duration": request.duration_minutes,
                    "steps": [
                        {
                            "step_number": 1,
                            "avatar_speech": content[:500],
                            "visual_demo": "Visual demonstration",
                            "highlight": "Key points",
                            "pause_for_student": True,
                            "question_to_student": "Do you understand this concept?",
                            "interaction_type": "explanation",
                            "estimated_time_seconds": 60
                        }
                    ],
                    "summary": "Lesson completed successfully",
                    "next_action": "Ready for next topic?"
                }
                
        except Exception as e:
            print(f"Google generation error: {e}")
            raise Exception("All AI providers failed to generate content")
    
    def _parse_teaching_steps(self, steps_data: List[Dict]) -> List[TeachingStep]:
        """Parse teaching steps from AI response"""
        
        teaching_steps = []
        for step_data in steps_data:
            step = TeachingStep(
                step_number=step_data.get("step_number", 1),
                avatar_speech=step_data.get("avatar_speech", ""),
                visual_demo=step_data.get("visual_demo", ""),
                highlight=step_data.get("highlight", ""),
                pause_for_student=step_data.get("pause_for_student", True),
                question_to_student=step_data.get("question_to_student"),
                interaction_type=step_data.get("interaction_type", "explanation"),
                estimated_time_seconds=step_data.get("estimated_time_seconds", 60)
            )
            teaching_steps.append(step)
        
        return teaching_steps
    
    async def _generate_avatar_response(self, request: TeachingRequest, lesson_content: Dict[str, Any]) -> AvatarResponse:
        """Generate avatar-specific response"""
        
        # Generate avatar-specific elements based on style
        avatar_elements = {
            AvatarStyle.PROFESSIONAL_TEACHER: {
                "gestures": ["pointing", "writing", "explaining"],
                "facial_expressions": ["neutral", "focused", "encouraging"],
                "emotions": ["confident", "patient", "knowledgeable"],
                "speech_rate": 1.0
            },
            AvatarStyle.FRIENDLY_MENTOR: {
                "gestures": ["waving", "thumbs_up", "encouraging"],
                "facial_expressions": ["smiling", "warm", "friendly"],
                "emotions": ["enthusiastic", "supportive", "caring"],
                "speech_rate": 1.1
            },
            AvatarStyle.TECHNICAL_EXPERT: {
                "gestures": ["demonstrating", "pointing", "adjusting"],
                "facial_expressions": ["focused", "precise", "analytical"],
                "emotions": ["confident", "technical", "methodical"],
                "speech_rate": 0.9
            }
        }
        
        style_config = avatar_elements.get(request.avatar_style, avatar_elements[AvatarStyle.PROFESSIONAL_TEACHER])
        
        return AvatarResponse(
            speech=lesson_content.get("title", ""),
            gestures=style_config["gestures"],
            facial_expressions=style_config["facial_expressions"],
            emotions=style_config["emotions"],
            visual_elements=[
                {
                    "type": "whiteboard",
                    "content": lesson_content.get("title", ""),
                    "position": {"x": 0.5, "y": 0.1}
                }
            ]
        )
    
    async def answer_student_question(self, question: str, context: Dict[str, Any]) -> str:
        """Answer a student's question in real-time"""
        
        try:
            prompt = f"""
            As an expert teacher, answer this student question: "{question}"
            
            Context: {context}
            
            Provide a clear, encouraging answer that:
            1. Directly addresses the question
            2. Provides relevant examples
            3. Encourages further learning
            4. Is appropriate for the student's level
            
            Keep it concise but comprehensive.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful teacher answering student questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error answering question: {e}")
            return "I'm here to help! Could you please rephrase your question so I can better assist you?"

# Global instance
ai_teaching_engine = AITeachingEngine()
