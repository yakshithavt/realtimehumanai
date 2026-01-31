import React from 'react';
import { Header } from '@/components/Header';
import { ModeTabs } from '@/components/ModeTabs';
import { ImageUploader } from '@/components/ImageUploader';
import { ChatBox } from '@/components/ChatBox';
import { ResponseBox } from '@/components/ResponseBox';
import { ScreenShareCapture } from '@/components/ScreenShareCapture';
import LiveAvatar from '@/components/LiveAvatar';
import { AppProvider, useApp } from '@/contexts/AppContext';

function DashboardContent() {
  const { activeMode } = useApp();

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
              </h2>

              {activeMode === 'vision' && <ImageUploader />}
              {activeMode === 'chat' && (
                <div className="h-[400px]">
                  <ChatBox />
                </div>
              )}
              {activeMode === 'screen' && <ScreenShareCapture />}
            </div>

            {/* Chat box also available in vision and screen modes */}
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
