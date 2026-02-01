from typing import Dict, List, Optional, Any
import json
from pathlib import Path
import time
import google.generativeai as genai
import openai
from .multi_language_service import multi_language_service

class RegionalAITeachingEngine:
    """Advanced AI teaching engine with regional language support"""
    
    def __init__(self):
        self.data_dir = Path("data/lessons")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.load_api_keys()
        self.lesson_templates = self._load_lesson_templates()
    
    def load_api_keys(self):
        """Load API keys from environment"""
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        # Google Gemini
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        if self.google_api_key:
            genai.configure(api_key=self.google_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        # OpenAI
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
    
    def _load_lesson_templates(self) -> Dict[str, Dict]:
        """Load lesson templates for different subjects and languages"""
        return {
            "mathematics": {
                "algebra": {
                    "hi": {
                        "title": "बीजगणित का परिचय",
                        "description": "चरों और समीकरणों की समझ",
                        "steps": [
                            "चर क्या है?",
                            "रैखिक समीकरण कैसे हल करें?",
                            "व्यावहारिक उदाहरण"
                        ]
                    },
                    "ta": {
                        "title": "இயற்கணிதத்தின் அறிமுகம்",
                        "description": "மாறிகள் மற்றும் சமன்பாடுகளின் புரிதல்",
                        "steps": [
                            "மாறி என்றால் என்ன?",
                            "நேரியல் சமன்பாடுகளை எப்படி தீர்க்கலாம்?",
                            "நடைமுறை உதாரணங்கள்"
                        ]
                    },
                    "te": {
                        "title": "బీజగణితం పరిచయం",
                        "description": "వేరియేబుల్స్ మరియు సమీకరణాల అవగాహన",
                        "steps": [
                            "వేరియేబుల్ అంటే ఏమిటి?",
                            "రేఖీయ సమీకరణాలు ఎలా పరిష్కరించాలి?",
                            "ప్రాయోగిక ఉదాహరణలు"
                        ]
                    }
                },
                "geometry": {
                    "hi": {
                        "title": "ज्यामिति की दुनिया",
                        "description": "आकृतियों और उनके गुणों का अध्ययन",
                        "steps": [
                            "बुनियादी आकृतियां",
                            "कोण और उनके प्रकार",
                            "क्षेत्रफल की गणना"
                        ]
                    },
                    "ta": {
                        "title": "வடிவவியலின் உலகம்",
                        "description": "வடிவங்கள் மற்றும் அவற்றின் பண்புகளின் ஆய்வு",
                        "steps": [
                            "அடிப்படை வடிவங்கள்",
                            "கோணங்கள் மற்றும் அவற்றின் வகைகள்",
                            "பரப்பளவு கணக்கீடு"
                        ]
                    }
                }
            },
            "science": {
                "physics": {
                    "hi": {
                        "title": "भौतिकी के मूल सिद्धांत",
                        "description": "ऊर्जा, बल और गति की समझ",
                        "steps": [
                            "न्यूटन के नियम",
                            "ऊर्जा के रूप",
                            "विद्युत और चुंबकत्व"
                        ]
                    },
                    "ta": {
                        "title": "இயற்பியலின் அடிப்படை கோட்பாடுகள்",
                        "description": "ஆற்றல், விசை மற்றும் இயக்கத்தின் புரிதல்",
                        "steps": [
                            "நியூட்டனின் விதிகள்",
                            "ஆற்றலின் வடிவங்கள்",
                            "மின்சாரம் மற்றும் காந்தவியல்"
                        ]
                    }
                },
                "chemistry": {
                    "hi": {
                        "title": "रसायन विज्ञान का परिचय",
                        "description": "पदार्थों और उनके गुणों का अध्ययन",
                        "steps": [
                            "परमाणु की संरचना",
                            "रासायनिक बंधन",
                            "अम्ल और क्षार"
                        ]
                    }
                }
            },
            "coding": {
                "python": {
                    "hi": {
                        "title": "पायथन प्रोग्रामिंग",
                        "description": "प्रोग्रामिंग की दुनिया में कदम",
                        "steps": [
                            "पायथन का परिचय",
                            "चर और डेटा टाइप",
                            "नियंत्रण प्रवाह"
                        ]
                    },
                    "ta": {
                        "title": "பைதான் நிரலாக்கம்",
                        "description": "நிரலாக்க உலகில் அடி எடுத்து வைப்பது",
                        "steps": [
                            "பைதான் அறிமுகம்",
                            "மாறிகள் மற்றும் தரவு வகைகள்",
                            "கட்டுப்பாட்டு ஓட்டம்"
                        ]
                    }
                }
            }
        }
    
    async def generate_regional_lesson(
        self, 
        subject: str, 
        topic: str, 
        language: str, 
        difficulty: str = "intermediate"
    ) -> Dict[str, Any]:
        """Generate lesson in regional language"""
        
        # Get lesson template
        template = self.lesson_templates.get(subject, {}).get(topic, {}).get(language)
        
        if not template:
            # Fallback to English template
            template = self.lesson_templates.get(subject, {}).get(topic, {}).get("en", {
                "title": f"{topic.title()} - {subject.title()}",
                "description": f"Learn {topic} in {subject}",
                "steps": ["Introduction", "Concept", "Practice", "Summary"]
            })
        
        # Generate AI content if API keys available
        ai_content = await self._generate_ai_content(subject, topic, language, difficulty)
        
        return {
            "success": True,
            "subject": subject,
            "topic": topic,
            "language": language,
            "difficulty": difficulty,
            "title": template["title"],
            "description": template["description"],
            "steps": template["steps"],
            "ai_content": ai_content,
            "generated_at": time.time()
        }
    
    async def _generate_ai_content(
        self, 
        subject: str, 
        topic: str, 
        language: str, 
        difficulty: str
    ) -> Optional[Dict[str, Any]]:
        """Generate AI-powered content in regional language"""
        
        try:
            # Use Google Gemini if available
            if hasattr(self, 'gemini_model'):
                prompt = self._create_regional_prompt(subject, topic, language, difficulty)
                response = self.gemini_model.generate_content(prompt)
                
                return {
                    "provider": "Google Gemini",
                    "content": response.text,
                    "language": language,
                    "confidence": 0.9
                }
            
            # Use OpenAI if available
            elif self.openai_api_key:
                prompt = self._create_regional_prompt(subject, topic, language, difficulty)
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": f"You are an expert teacher who teaches in {language} language."},
                        {"role": "user", "content": prompt}
                    ]
                )
                
                return {
                    "provider": "OpenAI GPT-4",
                    "content": response.choices[0].message.content,
                    "language": language,
                    "confidence": 0.95
                }
        
        except Exception as e:
            print(f"AI content generation failed: {e}")
            return None
    
    def _create_regional_prompt(
        self, 
        subject: str, 
        topic: str, 
        language: str, 
        difficulty: str
    ) -> str:
        """Create prompt for regional language content generation"""
        
        language_names = {
            "hi": "Hindi",
            "ta": "Tamil", 
            "te": "Telugu",
            "bn": "Bengali",
            "mr": "Marathi",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi"
        }
        
        lang_name = language_names.get(language, language)
        
        return f"""
        Create an educational lesson about {topic} in {subject} for {difficulty} level students.
        
        Requirements:
        1. Write the entire content in {lang_name} language
        2. Use simple, clear language appropriate for {difficulty} level
        3. Include practical examples and real-world applications
        4. Structure the content with clear headings and bullet points
        5. Make it engaging and interactive
        
        Topic: {topic}
        Subject: {subject}
        Language: {lang_name}
        Difficulty: {difficulty}
        
        Please provide comprehensive educational content that teaches this topic effectively in {lang_name}.
        """
    
    async def answer_regional_question(
        self, 
        question: str, 
        subject: str, 
        language: str, 
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Answer question in regional language"""
        
        try:
            # Try AI first
            if hasattr(self, 'gemini_model'):
                prompt = f"""
                Answer this educational question in {language} language:
                
                Question: {question}
                Subject: {subject}
                Context: {context or 'General learning context'}
                
                Provide a clear, educational answer in {language}. Use simple language and include examples if helpful.
                """
                
                response = self.gemini_model.generate_content(prompt)
                
                return {
                    "success": True,
                    "question": question,
                    "answer": response.text,
                    "language": language,
                    "provider": "Google Gemini",
                    "confidence": 0.9
                }
            
            # Fallback responses for regional languages
            fallback_responses = {
                "hi": {
                    "math": "यह एक अच्छा गणित का प्रश्न है। आइए इसे चरण दर चरण समझते हैं।",
                    "science": "यह विज्ञान से संबंधित एक महत्वपूर्ण प्रश्न है।",
                    "coding": "प्रोग्रामिंग में यह एक आम समस्या है।"
                },
                "ta": {
                    "math": "இது ஒரு நல்ல கணித கேள்வி. இதை படிப்படியாக புரிந்து கொள்ளுங்கள்.",
                    "science": "இது அறிவியல் தொடர்பான ஒரு முக்கிய கேள்வி.",
                    "coding": "நிரலாக்கத்தில் இது ஒரு பொதுவான சிக்கல்."
                },
                "te": {
                    "math": "ఇది ఒక మంచి గణిత ప్రశ్న. దీనిని దశల వారీగా అర్థం చేసుకోండి.",
                    "science": "ఇది సైన్స్‌కి సంబంధించిన ఒక ముఖ్యమైన ప్రశ్న.",
                    "coding": "ప్రోగ్రామింగ్‌లో ఇది ఒక సాధారణ సమస్య."
                }
            }
            
            fallback = fallback_responses.get(language, {}).get(
                subject, 
                f"Thank you for your question in {language}. Let me help you understand this concept."
            )
            
            return {
                "success": True,
                "question": question,
                "answer": fallback,
                "language": language,
                "provider": "Fallback",
                "confidence": 0.6
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question": question,
                "language": language
            }
    
    def get_regional_teaching_modes(self, language: str) -> List[Dict[str, Any]]:
        """Get available teaching modes in regional language"""
        
        mode_translations = {
            "hi": {
                "hardware_lab": "हार्डवेयर प्रयोगशाला",
                "math_whiteboard": "गणित व्हाइटबोर्ड", 
                "science_simulation": "विज्ञान सिमुलेशन",
                "coding_workshop": "कोडिंग कार्यशाला"
            },
            "ta": {
                "hardware_lab": "ஹார்ட்வேர் ஆய்வகம்",
                "math_whiteboard": "கணித வெள்ளை பலகை",
                "science_simulation": "அறிவியல் உருவகப்படுத்துதல்", 
                "coding_workshop": "குறியீட்டு பட்டறை"
            },
            "te": {
                "hardware_lab": "హార్డ్‌వేర్ ప్రయోగశాల",
                "math_whiteboard": "గణిత వైట్‌బోర్డ్",
                "science_simulation": "సైన్స్ సిమ్యులేషన్",
                "coding_workshop": "కోడింగ్ వర్క్‌షాప్"
            }
        }
        
        translations = mode_translations.get(language, mode_translations["en"])
        
        return [
            {
                "id": "hardware_lab",
                "name": translations.get("hardware_lab", "Hardware Laboratory"),
                "description": "Interactive electronics and robotics simulation"
            },
            {
                "id": "math_whiteboard", 
                "name": translations.get("math_whiteboard", "Mathematics Whiteboard"),
                "description": "Interactive math problem solving"
            },
            {
                "id": "science_simulation",
                "name": translations.get("science_simulation", "Science Simulation"),
                "description": "Physics, chemistry, and biology experiments"
            },
            {
                "id": "coding_workshop",
                "name": translations.get("coding_workshop", "Coding Workshop"),
                "description": "Live programming education"
            }
        ]

# Singleton instance
regional_ai_teaching_engine = RegionalAITeachingEngine()
