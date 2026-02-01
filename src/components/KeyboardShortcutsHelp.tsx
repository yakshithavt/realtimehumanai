import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Keyboard, X } from 'lucide-react';

interface ShortcutItem {
  keys: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Record<string, string>;
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const shortcutList: ShortcutItem[] = Object.entries(shortcuts).map(([keys, description]) => ({
    keys,
    description,
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Keyboard className="w-4 h-4 mr-2" />
          Keyboard Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {shortcutList.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-secondary border border-border/50 rounded">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Most shortcuts work globally, even when not focused on the input field.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
