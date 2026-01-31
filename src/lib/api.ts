import { API_ENDPOINTS } from './config';

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

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }
    return response.json();
  }

  async analyzeImage(file: File, language: string): Promise<VisionAnalyzeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await fetch(API_ENDPOINTS.vision.analyze, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<VisionAnalyzeResponse>(response);
  }

  async chat(message: string, language: string, context?: string): Promise<ChatResponse> {
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

    return this.handleResponse<ChatResponse>(response);
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

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(API_ENDPOINTS.health);
    return this.handleResponse<{ status: string }>(response);
  }
}

export const apiService = new ApiService();
