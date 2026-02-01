import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Search, Eye, MessageSquare, Monitor, Folder, Mic, Volume2, Download, Keyboard, User, Settings, Globe, Shield, Zap } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: 'getting-started-1',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click on the sign-in button in the header, then select "Sign Up". Fill in your name, email, and password (minimum 6 characters). Your account will be created instantly and you can start using all features.',
    icon: <User className="w-4 h-4" />,
    tags: ['account', 'registration', 'signup']
  },
  {
    id: 'getting-started-2',
    category: 'Getting Started',
    question: 'What languages are supported?',
    answer: 'AI Vision Tutor supports 14 languages: English, Tamil, Hindi, Telugu, Malayalam, Spanish, French, German, Japanese, Chinese, Arabic, Portuguese, Korean, and Russian. You can switch languages using the language selector in the header.',
    icon: <Globe className="w-4 h-4" />,
    tags: ['languages', 'translation', 'multilingual']
  },
  {
    id: 'vision-1',
    category: 'Vision Mode',
    question: 'How does image analysis work?',
    answer: 'Upload an image using the Image Uploader in Vision mode. The AI will analyze the image content and provide detailed descriptions, identify objects, text, and context in your selected language.',
    icon: <Eye className="w-4 h-4" />,
    tags: ['vision', 'images', 'analysis']
  },
  {
    id: 'vision-2',
    category: 'Vision Mode',
    question: 'What image formats are supported?',
    answer: 'We support JPEG, PNG, GIF, and WebP image formats. Files should be under 10MB for optimal performance.',
    icon: <Eye className="w-4 h-4" />,
    tags: ['vision', 'formats', 'images']
  },
  {
    id: 'chat-1',
    category: 'Chat Mode',
    question: 'How do I chat with the AI?',
    answer: 'Switch to Chat mode and type your question in the input field. The AI will respond in your selected language. You can also use voice input by clicking the microphone button.',
    icon: <MessageSquare className="w-4 h-4" />,
    tags: ['chat', 'conversation', 'ai']
  },
  {
    id: 'chat-2',
    category: 'Chat Mode',
    question: 'Can I export my chat history?',
    answer: 'Yes! Click the "Export Chat" button in the footer. You can download your conversations in JSON, text, CSV, or Markdown formats.',
    icon: <Download className="w-4 h-4" />,
    tags: ['chat', 'export', 'history']
  },
  {
    id: 'screen-1',
    category: 'Screen Share',
    question: 'How does screen sharing work?',
    answer: 'In Screen Share mode, click "Start Screen Share" and select your screen or window. The AI can analyze your screen content in real-time or capture frames for analysis.',
    icon: <Monitor className="w-4 h-4" />,
    tags: ['screen', 'sharing', 'tutoring']
  },
  {
    id: 'screen-2',
    category: 'Screen Share',
    question: 'What is continuous analysis?',
    answer: 'Continuous analysis automatically captures and analyzes your screen at regular intervals (3-30 seconds). Enable it by clicking the "Auto" button after starting screen share.',
    icon: <Zap className="w-4 h-4" />,
    tags: ['screen', 'automation', 'analysis']
  },
  {
    id: 'files-1',
    category: 'File Upload',
    question: 'What file types can I upload?',
    answer: 'You can upload PDFs, Word documents, Excel spreadsheets, PowerPoint presentations, text files, CSV files, and images. Maximum file size is 10MB.',
    icon: <Folder className="w-4 h-4" />,
    tags: ['files', 'documents', 'upload']
  },
  {
    id: 'files-2',
    category: 'File Upload',
    question: 'How does file analysis work?',
    answer: 'Upload your file and the AI will extract and analyze the content, providing summaries, insights, and answering questions about the document in your preferred language.',
    icon: <Folder className="w-4 h-4" />,
    tags: ['files', 'analysis', 'documents']
  },
  {
    id: 'voice-1',
    category: 'Voice Features',
    question: 'How do I use voice input?',
    answer: 'Click the microphone button in the chat area to start voice recognition. Speak clearly and the AI will convert your speech to text. Click again to stop recording.',
    icon: <Mic className="w-4 h-4" />,
    tags: ['voice', 'input', 'speech']
  },
  {
    id: 'voice-2',
    category: 'Voice Features',
    question: 'Can the AI speak responses?',
    answer: 'Yes! Click the volume button to have the AI read responses aloud. You can adjust voice settings, speed, and enable auto-speak in the voice settings panel.',
    icon: <Volume2 className="w-4 h-4" />,
    tags: ['voice', 'output', 'tts']
  },
  {
    id: 'shortcuts-1',
    category: 'Keyboard Shortcuts',
    question: 'What keyboard shortcuts are available?',
    answer: 'Press Ctrl+Enter to send messages, Ctrl+K to clear chat, Ctrl+D to toggle theme, Ctrl+1/2/3 to switch modes, Ctrl+M for voice, and ? for help. See the Keyboard Shortcuts help for complete list.',
    icon: <Keyboard className="w-4 h-4" />,
    tags: ['shortcuts', 'keyboard', 'productivity']
  },
  {
    id: 'account-1',
    category: 'Account & Privacy',
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption for data transmission and storage. Your chat history is stored locally in your browser and can be deleted at any time.',
    icon: <Shield className="w-4 h-4" />,
    tags: ['privacy', 'security', 'data']
  },
  {
    id: 'account-2',
    category: 'Account & Privacy',
    question: 'How do I delete my account?',
    answer: 'Click your profile avatar in the header and select "Settings". Look for the "Delete Account" option. Note that this action is irreversible and will delete all your data.',
    icon: <User className="w-4 h-4" />,
    tags: ['account', 'delete', 'privacy']
  },
  {
    id: 'troubleshooting-1',
    category: 'Troubleshooting',
    question: 'Why is voice input not working?',
    answer: 'Voice input requires microphone permissions. Make sure your browser has permission to access your microphone and that you\'re using a supported browser (Chrome, Edge, Firefox).',
    icon: <Mic className="w-4 h-4" />,
    tags: ['troubleshooting', 'voice', 'permissions']
  },
  {
    id: 'troubleshooting-2',
    category: 'Troubleshooting',
    question: 'Screen share is not working, what should I do?',
    answer: 'Screen sharing requires HTTPS in most browsers. Make sure you\'re using a secure connection and grant screen sharing permissions when prompted. Try refreshing the page if issues persist.',
    icon: <Monitor className="w-4 h-4" />,
    tags: ['troubleshooting', 'screen', 'permissions']
  },
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export function HelpFAQ() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const item = faqData.find(faq => faq.category === category);
    return item?.icon || <HelpCircle className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & FAQ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Help & Frequently Asked Questions
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions and learn how to use AI Vision Tutor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('All')}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-2"
              >
                {getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQs found matching your search.</p>
                </div>
              ) : (
                filteredFAQs.map((item) => (
                  <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{item.question}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm leading-relaxed">
                        {item.answer}
                      </CardDescription>
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredFAQs.length} FAQs found
            </p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
