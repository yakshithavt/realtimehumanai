import { useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';

interface ShortcutHandlers {
  onSend?: () => void;
  onClearChat?: () => void;
  onVoiceToggle?: () => void;
  onThemeToggle?: () => void;
  onModeSwitch?: (mode: 'vision' | 'chat' | 'screen') => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { input, language, setLanguage, messages } = useApp();
  const { theme, setTheme } = useTheme();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Handle specific shortcuts that work even when typing
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            handlers.onSend?.();
            break;
          case 'k':
            event.preventDefault();
            handlers.onClearChat?.();
            break;
        }
      }
      return;
    }

    // Global shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '/':
          event.preventDefault();
          // Focus input field
          const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
          inputElement?.focus();
          break;
        case 'd':
          event.preventDefault();
          handlers.onThemeToggle?.();
          break;
        case '1':
          event.preventDefault();
          handlers.onModeSwitch?.('vision');
          break;
        case '2':
          event.preventDefault();
          handlers.onModeSwitch?.('chat');
          break;
        case '3':
          event.preventDefault();
          handlers.onModeSwitch?.('screen');
          break;
        case 'm':
          event.preventDefault();
          handlers.onVoiceToggle?.();
          break;
      }
    }

    // Single key shortcuts
    switch (event.key) {
      case '?':
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
          event.preventDefault();
          // Show help modal (to be implemented)
          console.log('Help shortcut pressed');
        }
        break;
      case 'Escape':
        // Close any open modals or stop ongoing operations
        event.preventDefault();
        console.log('Escape pressed');
        break;
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Language shortcuts (Ctrl+Shift+L for next language)
  useEffect(() => {
    const handleLanguageShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        const languages = ['en', 'ta', 'hi', 'te', 'ml', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'pt', 'ko', 'ru'];
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        setLanguage(languages[nextIndex] as any);
      }
    };

    document.addEventListener('keydown', handleLanguageShortcut);
    return () => {
      document.removeEventListener('keydown', handleLanguageShortcut);
    };
  }, [language, setLanguage]);

  return {
    shortcuts: {
      'Ctrl+Enter': 'Send message',
      'Ctrl+K': 'Clear chat',
      'Ctrl+/': 'Focus input',
      'Ctrl+D': 'Toggle theme',
      'Ctrl+1/2/3': 'Switch modes (Vision/Chat/Screen)',
      'Ctrl+M': 'Toggle voice',
      'Ctrl+Shift+L': 'Next language',
      '?': 'Show help',
      'Escape': 'Close modals',
    }
  };
}
