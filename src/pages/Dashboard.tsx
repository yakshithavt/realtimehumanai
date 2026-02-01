import React from 'react';
import { Header } from '@/components/Header';
import { ModeTabs } from '@/components/ModeTabs';
import { ImageUploader } from '@/components/ImageUploader';
import { FileUploader } from '@/components/FileUploader';
import { ChatBox } from '@/components/ChatBox';
import { ResponseBox } from '@/components/ResponseBox';
import { ScreenShareCapture } from '@/components/ScreenShareCapture';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { ChatExport } from '@/components/ChatExport';
import { QuickStart } from '@/components/QuickStart';
import { HelpFAQ } from '@/components/HelpFAQ';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { NoteTaking } from '@/components/NoteTaking';
import LiveAvatar from '@/components/LiveAvatar';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/use-toast';

function DashboardContent() {
  const { activeMode, setActiveMode, clearMessages, input, setInput } = useApp();
  const { setTheme } = useTheme();
  const { toast } = useToast();

  // Keyboard shortcuts handlers
  const handleSend = () => {
    if (input.trim()) {
      // Trigger send message
      const sendButton = document.querySelector('button[type="submit"], button[data-send]') as HTMLButtonElement;
      sendButton?.click();
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed.',
    });
  };

  const handleVoiceToggle = () => {
    const voiceButton = document.querySelector('button[data-voice-toggle]') as HTMLButtonElement;
    voiceButton?.click();
  };

  const handleThemeToggle = () => {
    setTheme(theme => theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const handleModeSwitch = (mode: 'vision' | 'chat' | 'screen' | 'files' | 'analytics' | 'search' | 'notes') => {
    setActiveMode(mode);
    toast({
      title: 'Mode Changed',
      description: `Switched to ${mode} mode.`,
    });
  };

  const shortcuts = useKeyboardShortcuts({
    onSend: handleSend,
    onClearChat: handleClearChat,
    onVoiceToggle: handleVoiceToggle,
    onThemeToggle: handleThemeToggle,
    onModeSwitch: handleModeSwitch,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <ModeTabs />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Input Tools */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                {activeMode === 'vision' && '🖼️ Image Analysis'}
                {activeMode === 'chat' && '💬 Chat with AI'}
                {activeMode === 'screen' && '🖥️ Screen Share'}
                {activeMode === 'files' && '📁 File Upload'}
                {activeMode === 'analytics' && '📊 Analytics Dashboard'}
                {activeMode === 'search' && '🔍 Advanced Search'}
                {activeMode === 'notes' && '📝 Note Taking'}
              </h2>

              {activeMode === 'vision' && <ImageUploader />}
              {activeMode === 'chat' && (
                <div className="h-[400px]">
                  <ChatBox />
                </div>
              )}
              {activeMode === 'screen' && <ScreenShareCapture />}
              {activeMode === 'files' && <FileUploader />}
              {activeMode === 'analytics' && (
                <div className="h-[600px] overflow-y-auto">
                  <AnalyticsDashboard />
                </div>
              )}
              {activeMode === 'search' && (
                <div className="h-[600px] overflow-y-auto">
                  <AdvancedSearch />
                </div>
              )}
              {activeMode === 'notes' && (
                <div className="h-[600px] overflow-y-auto">
                  <NoteTaking />
                </div>
              )}
            </div>

            {/* Chat box also available in vision, screen, and files modes */}
            {activeMode !== 'chat' && (
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  💬 Follow-up Questions
                </h2>
                <div className="h-[300px]">
                  <ChatBox />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in">
              <div className="h-[400px]">
                <ResponseBox />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                🎭 LiveAvatar AI Assistant
              </h2>
              <div className="h-[400px]">
                <LiveAvatar />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
            <QuickStart />
            <KeyboardShortcutsHelp shortcuts={shortcuts.shortcuts} />
            <HelpFAQ />
            <ChatExport />
          </div>
          <p>
            AI Vision Avatar Tutor • Powered by OpenAI Vision & HeyGen
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
