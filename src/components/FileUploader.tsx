import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
  uploadedAt: Date;
}

const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, name: 'PDF' },
  'application/msword': { icon: FileText, name: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, name: 'Word' },
  'application/vnd.ms-excel': { icon: FileText, name: 'Excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, name: 'Excel' },
  'application/vnd.ms-powerpoint': { icon: FileText, name: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, name: 'PowerPoint' },
  'text/plain': { icon: FileText, name: 'Text' },
  'text/csv': { icon: FileText, name: 'CSV' },
  'image/jpeg': { icon: ImageIcon, name: 'JPEG' },
  'image/png': { icon: ImageIcon, name: 'PNG' },
  'image/gif': { icon: ImageIcon, name: 'GIF' },
  'image/webp': { icon: ImageIcon, name: 'WebP' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploader() {
  const { language, addMessage, setCurrentResponse, isAnalyzing, setIsAnalyzing } = useApp();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (!Object.keys(SUPPORTED_TYPES).includes(file.type)) {
      toast({
        title: 'Unsupported File Type',
        description: `File type ${file.type} is not supported.`,
        variant: 'destructive',
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Too Large',
        description: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}.`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Convert file to base64 for API
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data URL prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to uploaded files list
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Send to API for analysis
      addMessage({
        role: 'user',
        content: `[Uploaded file: ${file.name}]`,
        type: 'file',
      });

      setIsAnalyzing(true);
      const response = await apiService.analyzeFile(base64, file.name, file.type, language);

      if (response.success) {
        setCurrentResponse(response.response);
        addMessage({
          role: 'assistant',
          content: response.response,
        });

        toast({
          title: 'File Analyzed',
          description: `${file.name} has been processed successfully.`,
        });
      }

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Failed to process file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      processFile(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    const config = SUPPORTED_TYPES[fileType as keyof typeof SUPPORTED_TYPES];
    return config ? config.icon : File;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-300 cursor-pointer',
          dragActive ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="w-8 h-8 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isUploading ? 'Processing file...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground">
              PDFs, Word, Excel, PowerPoint, Text, CSV, Images (Max {formatFileSize(MAX_FILE_SIZE)})
            </p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.keys(SUPPORTED_TYPES).join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Processing...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadedFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="shrink-0 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
