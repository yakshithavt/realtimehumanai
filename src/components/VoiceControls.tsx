import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function VoiceControls() {
  const { input, setInput, language, messages } = useApp();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  
  const speechRecognition = useSpeechRecognition();
  const textToSpeech = useTextToSpeech();

  // Auto-speak new AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content) {
      // Auto-speak AI responses (optional - can be controlled by settings)
      // textToSpeech.speak(lastMessage.content);
    }
  }, [messages, textToSpeech]);

  const handleVoiceInput = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
      if (speechRecognition.transcript.trim()) {
        setInput(speechRecognition.transcript.trim());
        speechRecognition.resetTranscript();
      }
    } else {
      speechRecognition.startListening();
    }
  };

  const handleSpeakLastResponse = () => {
    const lastAiMessage = messages
      .filter(msg => msg.role === 'assistant')
      .pop();
    
    if (lastAiMessage?.content) {
      textToSpeech.speak(lastAiMessage.content);
    } else {
      toast({
        title: 'No Response to Speak',
        description: 'There is no AI response to read aloud.',
        variant: 'destructive',
      });
    }
  };

  const handleStopSpeaking = () => {
    textToSpeech.stop();
  };

  if (!speechRecognition.isSupported && !textToSpeech.isSupported) {
    return (
      <div className="text-xs text-muted-foreground p-2 rounded-lg bg-secondary/30">
        Voice features not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {speechRecognition.isSupported && (
          <Button
            onClick={handleVoiceInput}
            variant={speechRecognition.isListening ? "destructive" : "secondary"}
            size="sm"
            className="shrink-0"
          >
            {speechRecognition.isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Voice
              </>
            )}
          </Button>
        )}

        {textToSpeech.isSupported && (
          <>
            <Button
              onClick={handleSpeakLastResponse}
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={!messages.some(msg => msg.role === 'assistant')}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Speak
            </Button>
            
            {textToSpeech.isSpeaking && (
              <Button
                onClick={handleStopSpeaking}
                variant="destructive"
                size="sm"
                className="shrink-0"
              >
                <VolumeX className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </>
        )}

        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Voice Input Display */}
      {speechRecognition.isListening && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-pulse">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening...
          </div>
          {speechRecognition.transcript && (
            <div className="mt-2 text-sm text-gray-700">
              "{speechRecognition.transcript}"
            </div>
          )}
        </div>
      )}

      {/* Text-to-Speech Status */}
      {textToSpeech.isSpeaking && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Speaking...
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
          <h4 className="text-sm font-medium">Voice Settings</h4>
          
          {textToSpeech.voices.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium">Voice</label>
              <select 
                className="w-full px-2 py-1 rounded-md border border-border/50 bg-background text-sm"
                onChange={(e) => {
                  // Store selected voice preference
                  localStorage.setItem('selectedVoice', e.target.value);
                }}
                defaultValue={localStorage.getItem('selectedVoice') || ''}
              >
                <option value="">Default</option>
                {textToSpeech.voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium">Speech Rate</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1"
              className="w-full"
              onChange={(e) => {
                localStorage.setItem('speechRate', e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSpeak"
              className="rounded"
              onChange={(e) => {
                localStorage.setItem('autoSpeak', e.target.checked.toString());
              }}
            />
            <label htmlFor="autoSpeak" className="text-xs">
              Auto-speak AI responses
            </label>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(speechRecognition.error || textToSpeech.error) && (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">
            {speechRecognition.error || textToSpeech.error}
          </p>
        </div>
      )}
    </div>
  );
}
