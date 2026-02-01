import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Database, FileSpreadsheet, FileCode } from 'lucide-react';
import { useChatExport } from '@/hooks/useChatExport';
import { useToast } from '@/hooks/use-toast';

export function ChatExport() {
  const { exportToJSON, exportToText, exportToCSV, exportToMarkdown } = useChatExport();
  const { toast } = useToast();

  const handleExport = (format: string, exportFunction: () => void) => {
    try {
      exportFunction();
      toast({
        title: 'Export Successful',
        description: `Chat history exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export chat history. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const exportOptions = [
    {
      format: 'json',
      label: 'JSON',
      description: 'Structured data format',
      icon: Database,
      action: () => handleExport('json', exportToJSON),
    },
    {
      format: 'text',
      label: 'Plain Text',
      description: 'Simple text format',
      icon: FileText,
      action: () => handleExport('text', exportToText),
    },
    {
      format: 'csv',
      label: 'CSV',
      description: 'Spreadsheet format',
      icon: FileSpreadsheet,
      action: () => handleExport('csv', exportToCSV),
    },
    {
      format: 'markdown',
      label: 'Markdown',
      description: 'Formatted text',
      icon: FileCode,
      action: () => handleExport('markdown', exportToMarkdown),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Chat
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.format}
              onClick={option.action}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
