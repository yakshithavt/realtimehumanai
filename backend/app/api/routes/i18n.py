from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ...services.i18n_service import i18n_service

router = APIRouter(prefix="/i18n", tags=["Internationalization"])


class TranslateRequest(BaseModel):
    """Request model for translation."""
    text: str
    target_language: str
    source_language: str = "auto"


class DetectLanguageRequest(BaseModel):
    """Request model for language detection."""
    text: str


class AddTranslationRequest(BaseModel):
    """Request model for adding translations."""
    language_code: str
    key: str
    value: str


class AddLanguageRequest(BaseModel):
    """Request model for adding languages."""
    language_code: str
    name: str
    native_name: str
    flag: str
    rtl: bool = False


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """
    Translate text to target language.
    
    - **text**: Text to translate
    - **target_language**: Target language code
    - **source_language**: Source language code (default: "auto")
    """
    try:
        result = i18n_service.translate_text(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        return {
            "success": result.success,
            "translated_text": result.translated_text,
            "source_language": result.source_language,
            "target_language": result.target_language,
            "message": result.message
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


@router.post("/detect-language")
async def detect_language(request: DetectLanguageRequest):
    """
    Detect the language of given text.
    
    - **text**: Text to detect language for
    """
    try:
        result = i18n_service.detect_language(request.text)
        
        return {

@router.get("/languages")
async def get_supported_languages():
    """Get all supported regional languages"""
    try:
        languages = multi_language_service.get_supported_languages()
        return {
            "success": True,
            "languages": languages,
            "total": len(languages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting languages: {str(e)}")

@router.get("/languages/{region}")
async def get_languages_by_region(region: str):
    """Get languages by region"""
    try:
        languages = multi_language_service.get_languages_by_region(region)
        return {
            "success": True,
            "region": region,
            "languages": languages,
            "total": len(languages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting languages by region: {str(e)}")

@router.get("/languages/state/{state}")
async def get_languages_by_state(state: str):
    """Get languages by Indian state"""
    try:
        languages = multi_language_service.get_languages_by_state(state)
        return {
            "success": True,
            "state": state,
            "languages": languages,
            "total": len(languages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting languages by state: {str(e)}")

@router.get("/translations/{language_code}")
async def get_translations(language_code: str):
    """Get all translations for a language"""
    try:
        translations = multi_language_service.translations.get(language_code, {})
        return {
            "success": True,
            "language": language_code,
            "translations": translations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting translations: {str(e)}")

@router.get("/translate/{language_code}/{key}")
async def get_translation(language_code: str, key: str):
    """Get specific translation"""
    try:
        translation = multi_language_service.get_translation(language_code, key)
        return {
            "success": True,
            "language": language_code,
            "key": key,
            "translation": translation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting translation: {str(e)}")

@router.post("/translate")
async def translate_text(request: Dict[str, Any]):
    """Translate text to target language"""
    try:
        text = request.get("text", "")
        target_language = request.get("target_language", "en")
        
        translated_text = multi_language_service.translate_text(text, target_language)
        
        return {
            "success": True,
            "original_text": text,
            "target_language": target_language,
            "translated_text": translated_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error translating text: {str(e)}")

@router.get("/indian-languages")
async def get_indian_languages():
    """Get all Indian regional languages"""
    try:
        indian_languages = multi_language_service.get_languages_by_region("India")
        return {
            "success": True,
            "indian_languages": indian_languages,
            "total": len(indian_languages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting Indian languages: {str(e)}")

@router.get("/language-info/{language_code}")
async def get_language_info(language_code: str):
    """Get detailed information about a language"""
    try:
        if language_code not in multi_language_service.supported_languages:
            raise HTTPException(status_code=404, detail="Language not found")
        
        language_info = multi_language_service.supported_languages[language_code]
        translations = multi_language_service.translations.get(language_code, {})
        
        return {
            "success": True,
            "language_code": language_code,
            "info": language_info,
            "available_translations": list(translations.keys()),
            "total_translations": len(translations)
        }
            detail=f"Failed to get translations: {str(e)}"
        )


@router.post("/translations/add")
async def add_translation(request: AddTranslationRequest):
    """
    Add or update a translation.
    
    - **language_code**: Language code
    - **key**: Translation key
    - **value**: Translation value
    """
    try:
        success = i18n_service.add_translation(
            language_code=request.language_code,
            key=request.key,
            value=request.value
        )
        
        if success:
            return {
                "success": True,
                "message": f"Translation added for '{request.language_code}'"
            }
        else:
            return {
                "success": False,
                "message": f"Failed to add translation for '{request.language_code}'"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add translation: {str(e)}"
        )


@router.post("/languages/add")
async def add_language(request: AddLanguageRequest):
    """
    Add a new supported language.
    
    - **language_code**: Language code
    - **name**: English name of language
    - **native_name**: Native name of language
    - **flag**: Flag emoji
    - **rtl**: Right-to-left language
    """
    try:
        language_info = {
            "name": request.name,
            "native_name": request.native_name,
            "code": request.language_code,
            "flag": request.flag,
            "rtl": request.rtl,
            "translations": {}
        }
        
        success = i18n_service.add_language(
            language_code=request.language_code,
            language_info=language_info
        )
        
        if success:
            return {
                "success": True,
                "message": f"Language '{request.language_code}' added successfully"
            }
        else:
            return {
                "success": False,
                "message": f"Language '{request.language_code}' already exists or invalid data"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add language: {str(e)}"
        )


@router.get("/translate-ui/{language_code}")
async def get_ui_translations(language_code: str):
    """Get UI translations for the frontend."""
    try:
        translations = i18n_service.get_translations_for_language(language_code)
        lang_info = i18n_service.get_language_info(language_code)
        
        if not lang_info:
            raise HTTPException(
                status_code=404,
                detail=f"Language '{language_code}' not found"
            )
        
        return {
            "success": True,
            "language_info": {
                "name": lang_info["name"],
                "native_name": lang_info["native_name"],
                "code": lang_info["code"],
                "flag": lang_info["flag"],
                "rtl": lang_info["rtl"]
            },
            "translations": translations,
            "message": f"Retrieved UI translations for '{language_code}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get UI translations: {str(e)}"
        )
