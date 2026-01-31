import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/config';
import { useApp } from '@/contexts/AppContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useApp();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as LanguageCode)}>
      <SelectTrigger className="w-[180px] glass-card border-border/50 bg-secondary/50">
        <Globe className="w-4 h-4 mr-2 text-primary" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="glass-card border-border/50">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className="cursor-pointer hover:bg-secondary/50"
          >
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground/70">({lang.name})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
