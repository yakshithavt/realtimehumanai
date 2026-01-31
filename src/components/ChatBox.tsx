import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp, getLanguageName } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ChatBox() {
  const {
    messages,
    addMessage,
    language,
    isChatting,
    setIsChatting,
    setCurrentResponse,
    currentResponse,
  } = useApp();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isChatting) return;

    const userMessage = input.trim();
    setInput('');

    addMessage({
      role: 'user',
      content: userMessage,
      type: 'text',
    });

    setIsChatting(true);
    try {
      const response = await apiService.chat(
        userMessage,
        language,
        currentResponse || undefined
      );

      if (response.success) {
        setCurrentResponse(response.response);
        addMessage({
          role: 'assistant',
          content: response.response,
        });
      }
    } catch (error) {
      console.error('Error chatting:', error);
      toast({
        title: 'Chat Failed',
        description: error instanceof Error ? error.message : 'Failed to get response. Please check your backend connection.',
        variant: 'destructive',
      });
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground">Start a conversation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions in {getLanguageName(language)}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-up',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'gradient-primary text-primary-foreground'
                    )}
                  >
                    {message.role === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'glass-card border-border/50 rounded-tl-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isChatting && (
            <div className="flex gap-3 animate-slide-up">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="gradient-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Thinking in {getLanguageName(language)}...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-4 border-t border-border/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask a question in ${getLanguageName(language)}...`}
          className="flex-1 bg-secondary/50 border-border/50 focus:border-primary"
          disabled={isChatting}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isChatting}
          size="icon"
          className="gradient-primary text-primary-foreground glow-primary shrink-0"
        >
          {isChatting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
