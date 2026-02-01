from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
from ..services.multi_language_service import multi_language_service

router = APIRouter(prefix="/api/i18n", tags=["Internationalization"])

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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting language info: {str(e)}")
