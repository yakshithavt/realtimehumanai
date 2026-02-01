import { useState, useEffect, useCallback } from 'react';

interface TextToSpeechState {
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useTextToSpeech() {
  const [state, setState] = useState<TextToSpeechState>({
    isSpeaking: false,
    isSupported: false,
    error: null,
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setState(prev => ({ ...prev, isSupported: true }));

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      
      // Voices load asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, options?: { voice?: string; rate?: number; pitch?: number; volume?: number }) => {
    if (!state.isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    if (options?.voice) {
      const selectedVoice = voices.find(voice => voice.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, error: null }));
    };

    utterance.onerror = (event) => {
      setState(prev => ({
        ...prev,
        error: `Speech synthesis error: ${event.error}`,
        isSpeaking: false,
      }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    window.speechSynthesis.speak(utterance);
  }, [state.isSupported, voices]);

  const stop = useCallback(() => {
    if (state.isSupported) {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [state.isSupported]);

  const pause = useCallback(() => {
    if (state.isSupported) {
      window.speechSynthesis.pause();
    }
  }, [state.isSupported]);

  const resume = useCallback(() => {
    if (state.isSupported) {
      window.speechSynthesis.resume();
    }
  }, [state.isSupported]);

  return {
    ...state,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
