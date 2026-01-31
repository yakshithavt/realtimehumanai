import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp, getLanguageName } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ImageUploader() {
  const {
    uploadedImage,
    setUploadedImage,
    uploadedImagePreview,
    setUploadedImagePreview,
    language,
    setCurrentResponse,
    isAnalyzing,
    setIsAnalyzing,
    addMessage,
  } = useApp();
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setUploadedImage, setUploadedImagePreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const clearImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    try {
      addMessage({
        role: 'user',
        content: `[Uploaded image: ${uploadedImage.name}]`,
        type: 'image',
      });

      const response = await apiService.analyzeImage(uploadedImage, language);

      if (response.success) {
        setCurrentResponse(response.response);
        addMessage({
          role: 'assistant',
          content: response.response,
        });
        toast({
          title: 'Analysis Complete',
          description: `Image analyzed in ${getLanguageName(language)}`,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze image. Please check your backend connection.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!uploadedImagePreview ? (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer',
            'hover:border-primary/50 hover:bg-secondary/30',
            isDragActive
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-border/50 bg-secondary/20'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10 glow-primary">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse • PNG, JPG, GIF, WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden glass-card animate-scale-in">
          <img
            src={uploadedImagePreview}
            alt="Uploaded preview"
            className="w-full h-64 object-contain bg-background/50"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
            <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {uploadedImage?.name}
            </p>
          </div>
        </div>
      )}

      <Button
        onClick={analyzeImage}
        disabled={!uploadedImage || isAnalyzing}
        className="w-full gradient-primary text-primary-foreground font-medium glow-primary hover:opacity-90 transition-opacity"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing in {getLanguageName(language)}...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze Image
          </>
        )}
      </Button>
    </div>
  );
}
