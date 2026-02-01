import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Eye, MessageSquare, Monitor, Folder, Sparkles, BarChart, Search, Bookmark } from 'lucide-react';

interface ModeTabsProps {
  className?: string;
}

const modes = [
  { id: 'vision' as const, label: 'Vision', icon: Eye, description: 'Analyze images' },
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare, description: 'AI conversation' },
  { id: 'screen' as const, label: 'Screen', icon: Monitor, description: 'Live tutoring' },
  { id: 'files' as const, label: 'Files', icon: Folder, description: 'Upload documents' },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart, description: 'Usage insights' },
  { id: 'search' as const, label: 'Search', icon: Search, description: 'Find conversations' },
  { id: 'notes' as const, label: 'Notes', icon: Bookmark, description: 'Saved responses' },
];

export function ModeTabs({ className }: ModeTabsProps) {
  const { activeMode, setActiveMode } = useApp();

  return (
    <div className={cn('flex gap-2', className)}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300',
              'font-medium text-sm',
              isActive
                ? 'gradient-primary text-primary-foreground glow-primary'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
