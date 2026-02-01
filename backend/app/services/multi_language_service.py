from typing import Dict, List, Optional
from pathlib import Path
import json

class MultiLanguageService:
    """Service for handling multiple regional languages and local dialects"""
    
    def __init__(self):
        self.data_dir = Path("data/languages")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.supported_languages = self._load_supported_languages()
        self.translations = self._load_translations()
    
    def _load_supported_languages(self) -> Dict[str, Dict]:
        """Load all supported regional languages"""
        return {
            # Indian Languages
            "hi": {
                "name": "Hindi",
                "native_name": "हिन्दी",
                "region": "India",
                "script": "Devanagari",
                "direction": "ltr",
                "states": ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Delhi", "Haryana", "Jharkhand", "Chhattisgarh", "Himachal Pradesh", "Uttarakhand"]
            },
            "ta": {
                "name": "Tamil",
                "native_name": "தமிழ்",
                "region": "India",
                "script": "Tamil",
                "direction": "ltr",
                "states": ["Tamil Nadu", "Puducherry"]
            },
            "te": {
                "name": "Telugu",
                "native_name": "తెలుగు",
                "region": "India",
                "script": "Telugu",
                "direction": "ltr",
                "states": ["Andhra Pradesh", "Telangana"]
            },
            "bn": {
                "name": "Bengali",
                "native_name": "বাংলা",
                "region": "India/Bangladesh",
                "script": "Bengali",
                "direction": "ltr",
                "states": ["West Bengal", "Tripura"]
            },
            "mr": {
                "name": "Marathi",
                "native_name": "मराठी",
                "region": "India",
                "script": "Devanagari",
                "direction": "ltr",
                "states": ["Maharashtra"]
            },
            "gu": {
                "name": "Gujarati",
                "native_name": "ગુજરાતી",
                "region": "India",
                "script": "Gujarati",
                "direction": "ltr",
                "states": ["Gujarat"]
            },
            "kn": {
                "name": "Kannada",
                "native_name": "ಕನ್ನಡ",
                "region": "India",
                "script": "Kannada",
                "direction": "ltr",
                "states": ["Karnataka"]
            },
            "ml": {
                "name": "Malayalam",
                "native_name": "മലയാളം",
                "region": "India",
                "script": "Malayalam",
                "direction": "ltr",
                "states": ["Kerala"]
            },
            "pa": {
                "name": "Punjabi",
                "native_name": "ਪੰਜਾਬੀ",
                "region": "India",
                "script": "Gurmukhi",
                "direction": "ltr",
                "states": ["Punjab"]
            },
            "or": {
                "name": "Odia",
                "native_name": "ଓଡ଼ିଆ",
                "region": "India",
                "script": "Odia",
                "direction": "ltr",
                "states": ["Odisha"]
            },
            "as": {
                "name": "Assamese",
                "native_name": "অসমীয়া",
                "region": "India",
                "script": "Assamese",
                "direction": "ltr",
                "states": ["Assam"]
            },
            "ur": {
                "name": "Urdu",
                "native_name": "اردو",
                "region": "India/Pakistan",
                "script": "Arabic-Persian",
                "direction": "rtl",
                "states": ["Jammu and Kashmir", "Telangana"]
            },
            "ne": {
                "name": "Nepali",
                "native_name": "नेपाली",
                "region": "India/Nepal",
                "script": "Devanagari",
                "direction": "ltr",
                "states": ["Sikkim", "West Bengal"]
            }
        }
    
    def _load_translations(self) -> Dict[str, Dict]:
        """Load translations for all supported languages"""
        translations = {}
        
        # English (base)
        translations["en"] = {
            "welcome": "Welcome to AI Teacher Avatar",
            "start_lesson": "Start Lesson",
            "ask_question": "Ask Question",
            "hardware_lab": "Hardware Laboratory",
            "math_whiteboard": "Mathematics Whiteboard",
            "science_simulation": "Science Simulation",
            "coding_workshop": "Coding Workshop",
            "avatar_system": "Avatar System",
            "analytics": "Analytics",
            "profile": "Profile",
            "settings": "Settings",
            "progress": "Progress",
            "completed": "Completed",
            "in_progress": "In Progress",
            "difficulty": "Difficulty",
            "beginner": "Beginner",
            "intermediate": "Intermediate",
            "advanced": "Advanced",
            "language": "Language",
            "topic": "Topic",
            "session": "Session",
            "time": "Time",
            "score": "Score",
            "next": "Next",
            "previous": "Previous",
            "submit": "Submit",
            "cancel": "Cancel",
            "save": "Save",
            "delete": "Delete",
            "edit": "Edit",
            "view": "View",
            "search": "Search",
            "filter": "Filter",
            "sort": "Sort",
            "loading": "Loading...",
            "error": "Error",
            "success": "Success",
            "warning": "Warning",
            "info": "Information"
        }
        
        # Hindi
        translations["hi"] = {
            "welcome": "AI टीचर अवतार में आपका स्वागत है",
            "start_lesson": "पाठ शुरू करें",
            "ask_question": "प्रश्न पूछें",
            "hardware_lab": "हार्डवेयर प्रयोगशाला",
            "math_whiteboard": "गणित व्हाइटबोर्ड",
            "science_simulation": "विज्ञान सिमुलेशन",
            "coding_workshop": "कोडिंग कार्यशाला",
            "avatar_system": "अवतार प्रणाली",
            "analytics": "विश्लेषण",
            "profile": "प्रोफ़ाइल",
            "settings": "सेटिंग्स",
            "progress": "प्रगति",
            "completed": "पूर्ण हुआ",
            "in_progress": "प्रगति में",
            "difficulty": "कठिनाई",
            "beginner": "शुरुआती",
            "intermediate": "मध्यम",
            "advanced": "उन्नत",
            "language": "भाषा",
            "topic": "विषय",
            "session": "सत्र",
            "time": "समय",
            "score": "स्कोर",
            "next": "अगला",
            "previous": "पिछला",
            "submit": "जमा करें",
            "cancel": "रद्द करें",
            "save": "सहेजें",
            "delete": "हटाएं",
            "edit": "संपादित करें",
            "view": "देखें",
            "search": "खोजें",
            "filter": "फ़िल्टर",
            "sort": "छाँटें",
            "loading": "लोड हो रहा है...",
            "error": "त्रुटि",
            "success": "सफलता",
            "warning": "चेतावनी",
            "info": "जानकारी"
        }
        
        # Tamil
        translations["ta"] = {
            "welcome": "AI ஆசிரியர் அவதாரத்திற்கு வரவேற்கிறோம்",
            "start_lesson": "பாடத்தைத் தொடங்கு",
            "ask_question": "கேள்வி கேளுங்கள்",
            "hardware_lab": "ஹார்ட்வேர் ஆய்வகம்",
            "math_whiteboard": "கணித வெள்ளை பலகை",
            "science_simulation": "அறிவியல் உருவகப்படுத்துதல்",
            "coding_workshop": "குறியீட்டு பட்டறை",
            "avatar_system": "அவதார அமைப்பு",
            "analytics": "பகுப்பாய்வு",
            "profile": "சுயவிவரம்",
            "settings": "அமைப்புகள்",
            "progress": "முன்னேற்றம்",
            "completed": "முடிந்தது",
            "in_progress": "நடந்து கொண்டிருக்கிறது",
            "difficulty": "கடினம்",
            "beginner": "தொடக்கம்",
            "intermediate": "இடைநிலை",
            "advanced": "மேம்பட்ட",
            "language": "மொழி",
            "topic": "தலைப்பொருள்",
            "session": "அமர்வு",
            "time": "நேரம்",
            "score": "மதிப்பெண்",
            "next": "அடுத்தது",
            "previous": "முந்தையது",
            "submit": "சமர்ப்பிக்கவும்",
            "cancel": "ரத்துசெய்",
            "save": "சேமி",
            "delete": "நீக்கு",
            "edit": "திருத்து",
            "view": "பார்",
            "search": "தேடு",
            "filter": "வடிகட்டு",
            "sort": "வரிசைப்படுத்து",
            "loading": "ஏற்றுகிறது...",
            "error": "பிழை",
            "success": "வெற்றி",
            "warning": "எச்சரிக்கை",
            "info": "தகவல்"
        }
        
        # Telugu
        translations["te"] = {
            "welcome": "AI టీచర్ అవతారానికి స్వాగతం",
            "start_lesson": "పాఠాన్ని ప్రారంభించండి",
            "ask_question": "ప్రశ్న అడగండి",
            "hardware_lab": "హార్డ్‌వేర్ ప్రయోగశాల",
            "math_whiteboard": "గణిత వైట్‌బోర్డ్",
            "science_simulation": "సైన్స్ సిమ్యులేషన్",
            "coding_workshop": "కోడింగ్ వర్క్‌షాప్",
            "avatar_system": "అవతార వ్యవస్థ",
            "analytics": "విశ్లేషణలు",
            "profile": "ప్రొఫైల్",
            "settings": "సెట్టింగ్‌లు",
            "progress": "పురోగతి",
            "completed": "పూర్తయింది",
            "in_progress": "పురోగతిలో ఉంది",
            "difficulty": "కష్టతరం",
            "beginner": "ప్రారంభకుడు",
            "intermediate": "మధ్యస్థాయి",
            "advanced": "అధునాతన",
            "language": "భాష",
            "topic": "విషయం",
            "session": "సెషన్",
            "time": "సమయం",
            "score": "స్కోర్",
            "next": "తరువాత",
            "previous": "ముందు",
            "submit": "సమర్పించండి",
            "cancel": "రద్దు చేయండి",
            "save": "సేవ్ చేయండి",
            "delete": "తొలగించండి",
            "edit": "సవరించండి",
            "view": "చూడండి",
            "search": "వెతకండి",
            "filter": "ఫిల్టర్",
            "sort": "క్రమంలో పెట్టండి",
            "loading": "లోడ్ అవుతోంది...",
            "error": "లోపం",
            "success": "విజయం",
            "warning": "హెచ్చరిక",
            "info": "సమాచారం"
        }
        
        return translations
    
    def get_supported_languages(self) -> List[Dict]:
        """Get list of all supported languages"""
        return [
            {
                "code": code,
                **lang_info
            }
            for code, lang_info in self.supported_languages.items()
        ]
    
    def get_translation(self, language_code: str, key: str) -> str:
        """Get translation for a specific language and key"""
        if language_code not in self.translations:
            language_code = "en"  # Fallback to English
        
        if key not in self.translations[language_code]:
            return key  # Return key if translation not found
        
        return self.translations[language_code][key]
    
    def translate_text(self, text: str, target_language: str) -> str:
        """Translate text to target language (mock implementation)"""
        # This would integrate with Google Translate API or similar
        translations = {
            "hi": {
                "Welcome": "स्वागत है",
                "Hello": "नमस्ते",
                "Thank you": "धन्यवाद",
                "Goodbye": "अलविदा"
            },
            "ta": {
                "Welcome": "வரவேற்பு",
                "Hello": "வணக்கம்",
                "Thank you": "நன்றி",
                "Goodbye": "விடை"
            },
            "te": {
                "Welcome": "స్వాగతం",
                "Hello": "నమస్కారం",
                "Thank you": "ధన్యవాదాలు",
                "Goodbye": "వీడ్లు"
            }
        }
        
        if target_language in translations and text in translations[target_language]:
            return translations[target_language][text]
        
        return text  # Return original text if no translation found
    
    def get_languages_by_region(self, region: str) -> List[Dict]:
        """Get languages by region"""
        return [
            {
                "code": code,
                **lang_info
            }
            for code, lang_info in self.supported_languages.items()
            if lang_info["region"] == region
        ]
    
    def get_languages_by_state(self, state: str) -> List[Dict]:
        """Get languages by Indian state"""
        return [
            {
                "code": code,
                **lang_info
            }
            for code, lang_info in self.supported_languages.items()
            if state in lang_info.get("states", [])
        ]

# Singleton instance
multi_language_service = MultiLanguageService()
