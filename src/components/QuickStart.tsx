import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Eye, MessageSquare, Monitor, Folder, Mic, Volume2, Download, Keyboard, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  completed?: boolean;
}

export function QuickStart() {
  const { setActiveMode, language } = useApp();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI Vision Tutor',
      description: 'Your multilingual AI assistant for learning and exploration. Let\'s get you started!',
      icon: <Sparkles className="w-6 h-6" />,
      completed: true,
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: user ? `Welcome back, ${user.name}!` : 'Sign in to save your progress and access all features.',
      icon: user ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />,
    },
    {
      id: 'modes',
      title: 'Explore Different Modes',
      description: 'Switch between Vision, Chat, Screen Share, and File Upload modes to suit your needs.',
      icon: <Eye className="w-6 h-6" />,
      action: () => setActiveMode('vision'),
    },
    {
      id: 'chat',
      title: 'Try the Chat Feature',
      description: 'Ask questions in multiple languages. The AI responds in your preferred language.',
      icon: <MessageSquare className="w-6 h-6" />,
      action: () => setActiveMode('chat'),
    },
    {
      id: 'voice',
      title: 'Use Voice Controls',
      description: 'Enable voice input and output for hands-free interaction with the AI.',
      icon: <Mic className="w-6 h-6" />,
    },
    {
      id: 'screen',
      title: 'Screen Sharing',
      description: 'Share your screen for real-time AI tutoring and analysis.',
      icon: <Monitor className="w-6 h-6" />,
      action: () => setActiveMode('screen'),
    },
    {
      id: 'files',
      title: 'Upload Documents',
      description: 'Upload PDFs, Word documents, images, and more for AI analysis.',
      icon: <Folder className="w-6 h-6" />,
      action: () => setActiveMode('files'),
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Use keyboard shortcuts to navigate faster. Press ? to see all shortcuts.',
      icon: <Keyboard className="w-6 h-6" />,
    },
    {
      id: 'export',
      title: 'Export Your Chats',
      description: 'Download your conversation history in various formats for later reference.',
      icon: <Download className="w-6 h-6" />,
    },
  ];

  const progress = (completedSteps.size / tutorialSteps.length) * 100;

  const handleStepAction = (step: TutorialStep) => {
    if (step.action) {
      step.action();
      setCompletedSteps(prev => new Set([...prev, step.id]));
    }
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const resetTutorial = () => {
    setCompletedSteps(new Set());
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Play className="w-4 h-4" />
          Quick Start
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Quick Start Tutorial
          </DialogTitle>
          <DialogDescription>
            Get familiar with AI Vision Tutor's features in just a few minutes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Tutorial Steps */}
          <div className="space-y-4">
            {tutorialSteps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  isStepCompleted(step.id) 
                    ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' 
                    : 'hover:border-primary/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        {isStepCompleted(step.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {step.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                {step.action && !isStepCompleted(step.id) && (
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStepAction(step)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Try It
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markStepComplete(step.id)}
                      >
                        Skip
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={resetTutorial}>
              Reset Progress
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              {progress === 100 && (
                <Button className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  All Done!
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
