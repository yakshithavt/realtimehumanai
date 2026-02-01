import { API_ENDPOINTS } from './config';
import { apiCache, generateCacheKey } from '@/hooks/useApiCache';

export interface VisionAnalyzeResponse {
  success: boolean;
  response: string;
  language: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  language: string;
}

export interface AvatarResponse {
  success: boolean;
  video_url?: string;
  session_id?: string;
  status: string;
}

export interface ScreenFrameResponse {
  success: boolean;
  response: string;
  language: string;
}

export interface FileAnalysisResponse {
  success: boolean;
  response: string;
  language: string;
  fileName: string;
  fileType: string;
}

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }
    return response.json();
  }

  async analyzeImage(file: File, language: string): Promise<VisionAnalyzeResponse> {
    // For image analysis, we'll use a hash of the image as cache key
    const imageHash = await this.getFileHash(file);
    const cacheKey = generateCacheKey('vision', { imageHash, language });
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await fetch(API_ENDPOINTS.vision.analyze, {
      method: 'POST',
      body: formData,
    });

    const result = await this.handleResponse<VisionAnalyzeResponse>(response);
    
    // Cache successful responses for 10 minutes (longer for images)
    if (result.success) {
      apiCache.set(cacheKey, result, 10 * 60 * 1000);
    }
    
    return result;
  }

  private async getFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async chat(message: string, language: string, context?: string): Promise<ChatResponse> {
    const cacheKey = generateCacheKey('chat', { message, language, context });
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(API_ENDPOINTS.chat.respond, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        context,
      }),
    });

    const result = await this.handleResponse<ChatResponse>(response);
    
    // Cache successful responses for 5 minutes
    if (result.success) {
      apiCache.set(cacheKey, result);
    }
    
    return result;
  }

  async generateAvatar(text: string, language: string): Promise<AvatarResponse> {
    const response = await fetch(API_ENDPOINTS.heygen.avatar, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
      }),
    });

    return this.handleResponse<AvatarResponse>(response);
  }

  async analyzeScreenFrame(frameBase64: string, language: string): Promise<ScreenFrameResponse> {
    const response = await fetch(API_ENDPOINTS.screen.frame, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        frame: frameBase64,
        language,
      }),
    });

    return this.handleResponse<ScreenFrameResponse>(response);
  }

  async analyzeFile(fileBase64: string, fileName: string, fileType: string, language: string): Promise<FileAnalysisResponse> {
    const response = await fetch(`${API_ENDPOINTS.chat.respond}/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: fileBase64,
        fileName,
        fileType,
        language,
      }),
    });

    return this.handleResponse<FileAnalysisResponse>(response);
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(API_ENDPOINTS.health);
    return this.handleResponse<{ status: string }>(response);
  }

  // Cache management methods
  clearCache(): void {
    apiCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return apiCache.getStats();
  }

  clearExpiredCache(): void {
    apiCache.cleanup();
  }
}

export const apiService = new ApiService();
