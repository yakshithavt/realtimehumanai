import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'screen';
}

interface AppContextType {
  // Language
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  
  // Chat
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Current Response
  currentResponse: string | null;
  setCurrentResponse: (response: string | null) => void;
  
  // Input State
  input: string;
  setInput: (input: string) => void;
  
  // Loading States
  isAnalyzing: boolean;
  setIsAnalyzing: (loading: boolean) => void;
  isChatting: boolean;
  setIsChatting: (loading: boolean) => void;
  isGeneratingAvatar: boolean;
  setIsGeneratingAvatar: (loading: boolean) => void;
  
  // Avatar
  avatarVideoUrl: string | null;
  setAvatarVideoUrl: (url: string | null) => void;
  
  // Active Mode
  activeMode: 'vision' | 'chat' | 'screen' | 'files' | 'analytics' | 'search' | 'notes';
  setActiveMode: (mode: 'vision' | 'chat' | 'screen' | 'files' | 'analytics' | 'search' | 'notes') => void;
  
  // Uploaded Image
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  uploadedImagePreview: string | null;
  setUploadedImagePreview: (preview: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'vision' | 'chat' | 'screen' | 'files' | 'analytics' | 'search' | 'notes'>('vision');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        messages,
        addMessage,
        clearMessages,
        currentResponse,
        setCurrentResponse,
        input,
        setInput,
        isAnalyzing,
        setIsAnalyzing,
        isChatting,
        setIsChatting,
        isGeneratingAvatar,
        setIsGeneratingAvatar,
        avatarVideoUrl,
        setAvatarVideoUrl,
        activeMode,
        setActiveMode,
        uploadedImage,
        setUploadedImage,
        uploadedImagePreview,
        setUploadedImagePreview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function getLanguageName(code: LanguageCode): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || 'English';
}
