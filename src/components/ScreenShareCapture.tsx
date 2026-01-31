import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff, Loader2, Camera } from 'lucide-react';
import { useApp, getLanguageName } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ScreenShareCapture() {
  const {
    language,
    setCurrentResponse,
    addMessage,
    isAnalyzing,
    setIsAnalyzing,
  } = useApp();
  const { toast } = useToast();

  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Handle stream end (user stops sharing)
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      toast({
        title: 'Screen Share Started',
        description: 'Click "Capture Frame" to analyze your screen',
      });
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: 'Screen Share Failed',
        description: 'Unable to start screen sharing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsSharing(false);
    setFramePreview(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const frameBase64 = canvas.toDataURL('image/jpeg', 0.8);
    setFramePreview(frameBase64);

    // Send to API
    setIsAnalyzing(true);
    try {
      addMessage({
        role: 'user',
        content: '[Screen capture frame]',
        type: 'screen',
      });

      // Remove data URL prefix for API
      const base64Data = frameBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = await apiService.analyzeScreenFrame(base64Data, language);

      if (response.success) {
        setCurrentResponse(response.response);
        addMessage({
          role: 'assistant',
          content: response.response,
        });
        toast({
          title: 'Screen Analyzed',
          description: `Analysis complete in ${getLanguageName(language)}`,
        });
      }
    } catch (error) {
      console.error('Error analyzing screen:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze screen. Please check your backend connection.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {!isSharing ? (
        <div
          onClick={startScreenShare}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer',
            'hover:border-accent/50 hover:bg-accent/5 border-border/50 bg-secondary/20'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-accent/10 glow-accent">
              <Monitor className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">Start Screen Share</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your screen for live AI tutoring
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden glass-card">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 object-contain bg-background/50"
            />
            <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/90 text-destructive-foreground text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              LIVE
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={captureFrame}
              disabled={isAnalyzing}
              className="flex-1 gradient-primary text-primary-foreground font-medium glow-primary"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture & Analyze
                </>
              )}
            </Button>
            <Button
              onClick={stopScreenShare}
              variant="destructive"
              className="shrink-0"
            >
              <MonitorOff className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {framePreview && (
        <div className="rounded-xl overflow-hidden glass-card animate-scale-in">
          <img
            src={framePreview}
            alt="Captured frame"
            className="w-full h-32 object-contain bg-background/50"
          />
          <div className="p-2 text-center text-xs text-muted-foreground">
            Last captured frame
          </div>
        </div>
      )}
    </div>
  );
}
