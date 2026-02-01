import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff, Loader2, Camera, Play, Pause, RotateCcw } from 'lucide-react';
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
  const [isContinuousAnalysis, setIsContinuousAnalysis] = useState(false);
  const [analysisInterval, setAnalysisInterval] = useState(5000); // 5 seconds default
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    stopContinuousAnalysis(); // Stop continuous analysis
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsSharing(false);
    setFramePreview(null);
    setLastAnalysisTime(null);
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

    // Wait for video to be ready and have valid dimensions
    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready, skipping frame capture');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame to canvas
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Error drawing video frame:', error);
      return;
    }

    // Convert to base64 with validation
    let frameBase64: string;
    try {
      frameBase64 = canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error converting canvas to base64:', error);
      return;
    }

    // Validate the base64 string
    if (!frameBase64 || !frameBase64.startsWith('data:image/')) {
      console.error('Invalid base64 data generated');
      return;
    }

    setFramePreview(frameBase64);
    setLastAnalysisTime(new Date());

    // Send to API
    setIsAnalyzing(true);
    try {
      addMessage({
        role: 'user',
        content: `[Screen capture frame - ${new Date().toLocaleTimeString()}]`,
        type: 'screen',
      });

      // Remove data URL prefix for API and validate
      const base64Data = frameBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Enhanced validation for base64 data
      if (!base64Data || base64Data.length < 1000) { // Increased minimum size
        throw new Error('Invalid frame data. Frame appears to be empty or corrupted.');
      }
      
      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(base64Data)) {
        throw new Error('Invalid base64 format. Frame data is corrupted.');
      }
      
      // Log for debugging
      console.log('Sending frame data:', {
        length: base64Data.length,
        preview: base64Data.substring(0, 50) + '...',
        language
      });

      const response = await apiService.analyzeScreenFrame(base64Data, language);

      if (response.success) {
        setCurrentResponse(response.response);
        addMessage({
          role: 'assistant',
          content: response.response,
        });
      }
    } catch (error) {
      console.error('Error analyzing screen:', error);
      
      let errorMessage = 'Failed to analyze screen. Please check your backend connection.';
      if (error instanceof Error) {
        if (error.message.includes('Invalid frame data')) {
          errorMessage = 'Screen capture failed. Please try sharing your screen again.';
        } else if (error.message.includes('Invalid base64 format')) {
          errorMessage = 'Frame data corrupted. Please try capturing again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startContinuousAnalysis = () => {
    if (isContinuousAnalysis) return;
    
    setIsContinuousAnalysis(true);
    startAutoCapture();
    
    toast({
      title: 'Continuous Analysis Started',
      description: `Analyzing screen every ${analysisInterval / 1000} seconds`,
    });
  };

  const startAutoCapture = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Wait 2 seconds before starting auto-capture to ensure video is ready
    setTimeout(() => {
      // Capture first frame immediately
      captureFrame();
      
      // Then start interval
      const interval = setInterval(() => {
        captureFrame();
      }, analysisInterval);
      
      intervalRef.current = interval;
    }, 2000);
  };

  const stopContinuousAnalysis = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsContinuousAnalysis(false);
    
    toast({
      title: 'Continuous Analysis Stopped',
      description: 'Screen analysis has been paused',
    });
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
              onClick={isContinuousAnalysis ? stopContinuousAnalysis : startContinuousAnalysis}
              variant={isContinuousAnalysis ? "destructive" : "secondary"}
              className="shrink-0"
            >
              {isContinuousAnalysis ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Auto
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

          {/* Continuous Analysis Settings */}
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Analysis Interval</label>
              <select
                value={analysisInterval}
                onChange={(e) => setAnalysisInterval(Number(e.target.value))}
                className="px-3 py-1 rounded-md border border-border/50 bg-background text-sm"
                disabled={isContinuousAnalysis}
              >
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={15000}>15 seconds</option>
                <option value={30000}>30 seconds</option>
              </select>
            </div>
            {lastAnalysisTime && (
              <div className="text-xs text-muted-foreground">
                Last analysis: {lastAnalysisTime.toLocaleTimeString()}
              </div>
            )}
            {isContinuousAnalysis && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                Continuous analysis active
              </div>
            )}
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
