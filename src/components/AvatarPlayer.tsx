import React, { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function AvatarPlayer() {
  const { avatarVideoUrl, isGeneratingAvatar } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(progress);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    const time = (value[0] / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(value[0]);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const replay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  if (!avatarVideoUrl && !isGeneratingAvatar) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-card rounded-xl p-8 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Avatar</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Generate a speaking avatar to have the AI response delivered by a virtual presenter
        </p>
      </div>
    );
  }

  if (isGeneratingAvatar) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-card rounded-xl p-8 text-center">
        <div className="relative mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Generating Avatar...</h3>
        <p className="text-sm text-muted-foreground">
          Creating your AI presenter video
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass-card rounded-xl overflow-hidden">
      <div className="relative flex-1 bg-background/50">
        <video
          ref={videoRef}
          src={avatarVideoUrl!}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="w-full h-full object-contain"
        />

        {/* Play overlay */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-background/30 cursor-pointer transition-opacity hover:bg-background/40"
          >
            <div className="p-4 rounded-full gradient-primary glow-primary">
              <Play className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="hover:bg-secondary"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={replay}
              className="hover:bg-secondary"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="hover:bg-secondary"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="hover:bg-secondary"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
