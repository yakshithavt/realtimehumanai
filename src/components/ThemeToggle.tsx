import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      default:
        return 'light';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      default:
        return 'System theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(getNextTheme())}
      className="w-full justify-start"
      title={getLabel()}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
    </Button>
  );
}
