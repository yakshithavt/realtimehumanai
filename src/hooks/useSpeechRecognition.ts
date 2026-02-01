import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null,
  });

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        recognitionInstance.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setState(prev => ({ ...prev, transcript }));
        };

        recognitionInstance.onerror = (event: any) => {
          setState(prev => ({
            ...prev,
            error: `Speech recognition error: ${event.error}`,
            isListening: false,
          }));
        };

        recognitionInstance.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };

        setRecognition(recognitionInstance);
        setState(prev => ({ ...prev, isSupported: true }));
      } else {
        setState(prev => ({ ...prev, isSupported: false }));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !state.isListening) {
      recognition.start();
    }
  }, [recognition, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  }, [recognition, state.isListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
