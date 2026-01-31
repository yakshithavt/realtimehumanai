import React from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Sparkles, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border/50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl gradient-primary glow-primary">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <Zap className="absolute -bottom-1 -right-1 w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">AI Vision Tutor</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Multilingual AI Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
