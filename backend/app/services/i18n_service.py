from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
from pathlib import Path

class TranslationRequest(BaseModel):
    """Request model for translation."""
    text: str
    source_language: str
    target_language: str

class TranslationResponse(BaseModel):
    """Response model for translation."""
    success: bool
    translated_text: Optional[str] = None
    source_language: str
    target_language: str
    message: str

class LanguageDetectionRequest(BaseModel):
    """Request model for language detection."""
    text: str

class LanguageDetectionResponse(BaseModel):
    """Response model for language detection."""
    success: bool
    detected_language: Optional[str] = None
    confidence: Optional[float] = None
    message: str

class I18nService:
    """Internationalization and translation service."""
    
    def __init__(self):
        self.data_dir = Path("data/i18n")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.translations_file = self.data_dir / "translations.json"
        self.languages_file = self.data_dir / "languages.json"
        self._load_data()
    
    def _load_data(self):
        """Load existing translations and language data."""
        if self.translations_file.exists():
            try:
                with open(self.translations_file, 'r', encoding='utf-8') as f:
                    self.translations = json.load(f)
            except:
                self.translations = {}
        else:
            self.translations = {}
        
        if self.languages_file.exists():
            try:
                with open(self.languages_file, 'r', encoding='utf-8') as f:
                    self.languages = json.load(f)
            except:
                self.languages = self._get_default_languages()
        else:
            self.languages = self._get_default_languages()
            self._save_languages()
    
    def _save_translations(self):
        """Save translations to file."""
        with open(self.translations_file, 'w', encoding='utf-8') as f:
            json.dump(self.translations, f, indent=2, ensure_ascii=False)
    
    def _save_languages(self):
        """Save languages to file."""
        with open(self.languages_file, 'w', encoding='utf-8') as f:
            json.dump(self.languages, f, indent=2, ensure_ascii=False)
    
    def _get_default_languages(self) -> Dict[str, Any]:
        """Get default language configurations."""
        return {
            "en": {
                "name": "English",
                "native_name": "English",
                "code": "en",
                "flag": "🇺🇸",
                "rtl": False,
                "translations": {
                    "app_title": "AI Vision Avatar Tutor",
                    "vision_mode": "Vision",
                    "chat_mode": "Chat", 
                    "screen_mode": "Screen",
                    "files_mode": "Files",
                    "analytics_mode": "Analytics",
                    "search_mode": "Search",
                    "notes_mode": "Notes",
                    "start_avatar": "Start Avatar",
                    "stop_avatar": "Stop Avatar",
                    "capture_frame": "Capture & Analyze",
                    "send_message": "Send Message",
                    "upload_image": "Upload Image",
                    "upload_file": "Upload File",
                    "search_placeholder": "Search conversations...",
                    "create_note": "Create Note",
                    "note_title": "Note Title",
                    "note_content": "Note Content",
                    "save_note": "Save Note",
                    "delete_note": "Delete Note",
                    "edit_note": "Edit Note",
                    "favorite_note": "Favorite Note",
                    "no_notes_found": "No notes found",
                    "loading": "Loading...",
                    "error": "Error",
                    "success": "Success"
                }
            },
            "es": {
                "name": "Spanish",
                "native_name": "Español",
                "code": "es",
                "flag": "🇪🇸",
                "rtl": False,
                "translations": {
                    "app_title": "Tutor de Avatar de Visión IA",
                    "vision_mode": "Visión",
                    "chat_mode": "Chat",
                    "screen_mode": "Pantalla",
                    "files_mode": "Archivos",
                    "analytics_mode": "Análisis",
                    "search_mode": "Buscar",
                    "notes_mode": "Notas",
                    "start_avatar": "Iniciar Avatar",
                    "stop_avatar": "Detener Avatar",
                    "capture_frame": "Capturar y Analizar",
                    "send_message": "Enviar Mensaje",
                    "upload_image": "Subir Imagen",
                    "upload_file": "Subir Archivo",
                    "search_placeholder": "Buscar conversaciones...",
                    "create_note": "Crear Nota",
                    "note_title": "Título de Nota",
                    "note_content": "Contenido de Nota",
                    "save_note": "Guardar Nota",
                    "delete_note": "Eliminar Nota",
                    "edit_note": "Editar Nota",
                    "favorite_note": "Nota Favorita",
                    "no_notes_found": "No se encontraron notas",
                    "loading": "Cargando...",
                    "error": "Error",
                    "success": "Éxito"
                }
            },
            "fr": {
                "name": "French",
                "native_name": "Français",
                "code": "fr",
                "flag": "🇫🇷",
                "rtl": False,
                "translations": {
                    "app_title": "Tuteur Avatar Vision IA",
                    "vision_mode": "Vision",
                    "chat_mode": "Chat",
                    "screen_mode": "Écran",
                    "files_mode": "Fichiers",
                    "analytics_mode": "Analytique",
                    "search_mode": "Rechercher",
                    "notes_mode": "Notes",
                    "start_avatar": "Démarrer Avatar",
                    "stop_avatar": "Arrêter Avatar",
                    "capture_frame": "Capturer et Analyser",
                    "send_message": "Envoyer Message",
                    "upload_image": "Télécharger Image",
                    "upload_file": "Télécharger Fichier",
                    "search_placeholder": "Rechercher conversations...",
                    "create_note": "Créer Note",
                    "note_title": "Titre de Note",
                    "note_content": "Contenu de Note",
                    "save_note": "Sauvegarder Note",
                    "delete_note": "Supprimer Note",
                    "edit_note": "Modifier Note",
                    "favorite_note": "Note Favorie",
                    "no_notes_found": "Aucune note trouvée",
                    "loading": "Chargement...",
                    "error": "Erreur",
                    "success": "Succès"
                }
            },
            "de": {
                "name": "German",
                "native_name": "Deutsch",
                "code": "de",
                "flag": "🇩🇪",
                "rtl": False,
                "translations": {
                    "app_title": "KI-Vision-Avatar-Tutor",
                    "vision_mode": "Vision",
                    "chat_mode": "Chat",
                    "screen_mode": "Bildschirm",
                    "files_mode": "Dateien",
                    "analytics_mode": "Analytik",
                    "search_mode": "Suchen",
                    "notes_mode": "Notizen",
                    "start_avatar": "Avatar Starten",
                    "stop_avatar": "Avatar Stoppen",
                    "capture_frame": "Erfassen und Analysieren",
                    "send_message": "Nachricht Senden",
                    "upload_image": "Bild Hochladen",
                    "upload_file": "Datei Hochladen",
                    "search_placeholder": "Unterhaltungen suchen...",
                    "create_note": "Notiz Erstellen",
                    "note_title": "Notiztitel",
                    "note_content": "Notizinhalt",
                    "save_note": "Notiz Speichern",
                    "delete_note": "Notiz Löschen",
                    "edit_note": "Notiz Bearbeiten",
                    "favorite_note": "Lieblingsnotiz",
                    "no_notes_found": "Keine Notizen gefunden",
                    "loading": "Laden...",
                    "error": "Fehler",
                    "success": "Erfolg"
                }
            },
            "zh": {
                "name": "Chinese",
                "native_name": "中文",
                "code": "zh",
                "flag": "🇨🇳",
                "rtl": False,
                "translations": {
                    "app_title": "AI视觉头像导师",
                    "vision_mode": "视觉",
                    "chat_mode": "聊天",
                    "screen_mode": "屏幕",
                    "files_mode": "文件",
                    "analytics_mode": "分析",
                    "search_mode": "搜索",
                    "notes_mode": "笔记",
                    "start_avatar": "启动头像",
                    "stop_avatar": "停止头像",
                    "capture_frame": "捕获和分析",
                    "send_message": "发送消息",
                    "upload_image": "上传图片",
                    "upload_file": "上传文件",
                    "search_placeholder": "搜索对话...",
                    "create_note": "创建笔记",
                    "note_title": "笔记标题",
                    "note_content": "笔记内容",
                    "save_note": "保存笔记",
                    "delete_note": "删除笔记",
                    "edit_note": "编辑笔记",
                    "favorite_note": "收藏笔记",
                    "no_notes_found": "未找到笔记",
                    "loading": "加载中...",
                    "error": "错误",
                    "success": "成功"
                }
            },
            "ja": {
                "name": "Japanese",
                "native_name": "日本語",
                "code": "ja",
                "flag": "🇯🇵",
                "rtl": False,
                "translations": {
                    "app_title": "AIビジョンアバターチューター",
                    "vision_mode": "ビジョン",
                    "chat_mode": "チャット",
                    "screen_mode": "スクリーン",
                    "files_mode": "ファイル",
                    "analytics_mode": "分析",
                    "search_mode": "検索",
                    "notes_mode": "メモ",
                    "start_avatar": "アバター開始",
                    "stop_avatar": "アバター停止",
                    "capture_frame": "キャプチャと分析",
                    "send_message": "メッセージ送信",
                    "upload_image": "画像アップロード",
                    "upload_file": "ファイルアップロード",
                    "search_placeholder": "会話を検索...",
                    "create_note": "メモ作成",
                    "note_title": "メモタイトル",
                    "note_content": "メモ内容",
                    "save_note": "メモ保存",
                    "delete_note": "メモ削除",
                    "edit_note": "メモ編集",
                    "favorite_note": "お気に入りメモ",
                    "no_notes_found": "メモが見つかりません",
                    "loading": "読み込み中...",
                    "error": "エラー",
                    "success": "成功"
                }
            },
            "ar": {
                "name": "Arabic",
                "native_name": "العربية",
                "code": "ar",
                "flag": "🇸🇦",
                "rtl": True,
                "translations": {
                    "app_title": "مدرس الصورة الرمزية للرؤية الذكاء الاصطناعي",
                    "vision_mode": "الرؤية",
                    "chat_mode": "الدردشة",
                    "screen_mode": "الشاشة",
                    "files_mode": "الملفات",
                    "analytics_mode": "التحليلات",
                    "search_mode": "البحث",
                    "notes_mode": "الملاحظات",
                    "start_avatar": "بدء الصورة الرمزية",
                    "stop_avatar": "إيقاف الصورة الرمزية",
                    "capture_frame": "التقاط وتحليل",
                    "send_message": "إرسال رسالة",
                    "upload_image": "رفع صورة",
                    "upload_file": "رفع ملف",
                    "search_placeholder": "البحث في المحادثات...",
                    "create_note": "إنشاء ملاحظة",
                    "note_title": "عنوان الملاحظة",
                    "note_content": "محتوى الملاحظة",
                    "save_note": "حفظ الملاحظة",
                    "delete_note": "حذف الملاحظة",
                    "edit_note": "تحرير الملاحظة",
                    "favorite_note": "الملاحظة المفضلة",
                    "no_notes_found": "لم يتم العثور على ملاحظات",
                    "loading": "جاري التحميل...",
                    "error": "خطأ",
                    "success": "نجح"
                }
            }
        }
    
    def get_supported_languages(self) -> Dict[str, Any]:
        """Get all supported languages."""
        return self.languages
    
    def get_language_info(self, language_code: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific language."""
        return self.languages.get(language_code)
    
    def translate_text(self, text: str, target_language: str, source_language: str = "auto") -> TranslationResponse:
        """Translate text to target language."""
        try:
            # For now, use simple translation lookup
            # In a real implementation, you would integrate with Google Translate API or similar
            
            # Check if we have a direct translation
            if source_language == "auto":
                # Try to detect the language first
                detected = self.detect_language(text)
                if detected.success and detected.detected_language:
                    source_language = detected.detected_language
                else:
                    source_language = "en"
            
            # Get target language translations
            target_lang_info = self.languages.get(target_language)
            if not target_lang_info:
                return TranslationResponse(
                    success=False,
                    source_language=source_language,
                    target_language=target_language,
                    message=f"Target language '{target_language}' not supported"
                )
            
            translations = target_lang_info.get("translations", {})
            
            # Simple key-based translation (for UI strings)
            if text in translations:
                translated_text = translations[text]
            else:
                # For now, return original text if no translation found
                # In production, you'd use a translation API
                translated_text = text
            
            return TranslationResponse(
                success=True,
                translated_text=translated_text,
                source_language=source_language,
                target_language=target_language,
                message="Translation completed"
            )
            
        except Exception as e:
            return TranslationResponse(
                success=False,
                source_language=source_language,
                target_language=target_language,
                message=f"Translation failed: {str(e)}"
            )
    
    def detect_language(self, text: str) -> LanguageDetectionResponse:
        """Detect the language of the given text."""
        try:
            # Simple language detection based on character patterns
            # In production, you'd use a proper language detection library
            
            # Check for Arabic characters
            if any('\u0600' <= char <= '\u06FF' for char in text):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="ar",
                    confidence=0.8,
                    message="Language detected"
                )
            
            # Check for Chinese characters
            if any('\u4E00' <= char <= '\u9FFF' for char in text):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="zh",
                    confidence=0.8,
                    message="Language detected"
                )
            
            # Check for Japanese characters
            if any('\u3040' <= char <= '\u309F' or '\u30A0' <= char <= '\u30FF' for char in text):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="ja",
                    confidence=0.8,
                    message="Language detected"
                )
            
            # Check for common Spanish words
            spanish_indicators = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te']
            words = text.lower().split()
            if any(word in spanish_indicators for word in words[:5]):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="es",
                    confidence=0.6,
                    message="Language detected"
                )
            
            # Check for common French words
            french_indicators = ['le', 'de', 'et', 'à', 'les', 'des', 'en', 'un', 'il', 'être']
            if any(word in french_indicators for word in words[:5]):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="fr",
                    confidence=0.6,
                    message="Language detected"
                )
            
            # Check for common German words
            german_indicators = ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich']
            if any(word in german_indicators for word in words[:5]):
                return LanguageDetectionResponse(
                    success=True,
                    detected_language="de",
                    confidence=0.6,
                    message="Language detected"
                )
            
            # Default to English
            return LanguageDetectionResponse(
                success=True,
                detected_language="en",
                confidence=0.5,
                message="Language detected (defaulted to English)"
            )
            
        except Exception as e:
            return LanguageDetectionResponse(
                success=False,
                message=f"Language detection failed: {str(e)}"
            )
    
    def get_translations_for_language(self, language_code: str) -> Dict[str, str]:
        """Get all translations for a specific language."""
        lang_info = self.languages.get(language_code, {})
        return lang_info.get("translations", {})
    
    def add_translation(self, language_code: str, key: str, value: str) -> bool:
        """Add or update a translation."""
        if language_code not in self.languages:
            return False
        
        if "translations" not in self.languages[language_code]:
            self.languages[language_code]["translations"] = {}
        
        self.languages[language_code]["translations"][key] = value
        self._save_languages()
        return True
    
    def add_language(self, language_code: str, language_info: Dict[str, Any]) -> bool:
        """Add a new supported language."""
        if language_code in self.languages:
            return False
        
        required_fields = ["name", "native_name", "code", "flag", "rtl", "translations"]
        if not all(field in language_info for field in required_fields):
            return False
        
        self.languages[language_code] = language_info
        self._save_languages()
        return True


# Singleton instance
i18n_service = I18nService()
