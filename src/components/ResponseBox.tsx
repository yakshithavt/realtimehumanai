import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp, getLanguageName } from '@/contexts/AppContext';
import { Copy, Volume2, Loader2, Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ResponseBox() {
  const {
    currentResponse,
    isAnalyzing,
    isChatting,
    isGeneratingAvatar,
    setIsGeneratingAvatar,
    setAvatarVideoUrl,
    language,
  } = useApp();
  const { toast } = useToast();

  const isLoading = isAnalyzing || isChatting;

  const copyToClipboard = () => {
    if (currentResponse) {
      navigator.clipboard.writeText(currentResponse);
      toast({
        title: 'Copied!',
        description: 'Response copied to clipboard',
      });
    }
  };

  const generateAvatar = async () => {
    if (!currentResponse) return;

    setIsGeneratingAvatar(true);
    try {
      const response = await apiService.generateAvatar(currentResponse, language);

      if (response.success && response.video_url) {
        setAvatarVideoUrl(response.video_url);
        toast({
          title: 'Avatar Generated!',
          description: 'Your AI avatar is ready to speak',
        });
      } else {
        toast({
          title: 'Avatar Generation Started',
          description: response.status || 'Processing your request...',
        });
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast({
        title: 'Avatar Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate avatar. Please check your backend connection.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-primary">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Response</h3>
            <p className="text-xs text-muted-foreground">
              {getLanguageName(language)}
            </p>
          </div>
        </div>
        {currentResponse && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="hover:bg-secondary"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={generateAvatar}
              disabled={isGeneratingAvatar}
              className="hover:bg-secondary"
            >
              {isGeneratingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 glass-card rounded-xl p-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {isAnalyzing ? 'Analyzing image...' : 'Generating response...'}
              </span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        ) : currentResponse ? (
          <div className="animate-fade-in">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {currentResponse}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="p-4 rounded-full bg-accent/10 mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <p className="text-lg font-medium text-foreground">No response yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload an image or start chatting to get AI responses
            </p>
          </div>
        )}
      </ScrollArea>

      {currentResponse && (
        <Button
          onClick={generateAvatar}
          disabled={isGeneratingAvatar}
          className="mt-4 w-full gradient-primary text-primary-foreground font-medium glow-accent hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isGeneratingAvatar ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Avatar...
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 mr-2" />
              Generate Speaking Avatar
            </>
          )}
        </Button>
      )}
    </div>
  );
}
