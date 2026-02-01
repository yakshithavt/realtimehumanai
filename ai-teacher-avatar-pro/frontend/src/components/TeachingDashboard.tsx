import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import teachingService from '@/services/teachingService';
import { 
  Play, 
  Settings, 
  User, 
  BarChart3, 
  Zap, 
  Globe, 
  Brain,
  Monitor,
  Calculator,
  FlaskConical,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeachingMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function TeachingDashboard() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  const teachingModes: TeachingMode[] = [
    {
      id: 'hardware',
      title: 'Hardware Laboratory',
      description: 'Virtual electronics and robotics lab with 3D simulations',
      icon: <Monitor className="w-8 h-8" />,
      color: 'bg-blue-500',
      topics: ['Arduino Projects', 'Circuit Design', 'Robotics', 'IoT'],
      difficulty: 'intermediate'
    },
    {
      id: 'math',
      title: 'Mathematics Whiteboard',
      description: 'Interactive math problem solving with visual demonstrations',
      icon: <Calculator className="w-8 h-8" />,
      color: 'bg-green-500',
      topics: ['Algebra', 'Calculus', 'Geometry', 'Statistics'],
      difficulty: 'beginner'
    },
    {
      id: 'science',
      title: 'Science Simulations',
      description: 'Physics, chemistry, and biology experiments',
      icon: <FlaskConical className="w-8 h-8" />,
      color: 'bg-purple-500',
      topics: ['Physics', 'Chemistry', 'Biology', 'Astronomy'],
      difficulty: 'intermediate'
    },
    {
      id: 'coding',
      title: 'Coding Workshop',
      description: 'Interactive programming lessons with live code execution',
      icon: <Code className="w-8 h-8" />,
      color: 'bg-orange-500',
      topics: ['Python', 'JavaScript', 'Web Dev', 'AI/ML'],
      difficulty: 'advanced'
    }
  ];

  const handleStartLesson = async (modeId: string) => {
    const lessonData = {
      topic: modeId,
      mode: modeId,
      difficulty: selectedDifficulty,
      language: selectedLanguage
    };
    
    const result = await teachingService.startLesson(lessonData);
    
    if (result.success) {
      console.log('Lesson started:', result.session_id);
      navigate(`/${modeId}`);
    } else {
      console.error('Failed to start lesson:', result.error);
      // Still navigate for demo purposes
      navigate(`/${modeId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 AI Teacher Avatar Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience the future of education with live interactive teaching demos
          </p>
          
          {/* Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-40 border rounded px-3 py-2"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="zh">🇨🇳 Chinese</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="ar">🇸🇦 Arabic</option>
            </select>
            
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-40 border rounded px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* Teaching Modes Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {teachingModes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${mode.color} text-white group-hover:scale-110 transition-transform`}>
                    {mode.icon}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {mode.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{mode.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mode.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartLesson(mode.id)}
                    className="w-full group-hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">🌟 Advanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Teaching</h3>
                  <p className="text-sm text-gray-600">
                    Advanced AI with multiple providers for personalized learning
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Interactive Demos</h3>
                  <p className="text-sm text-gray-600">
                    Live step-by-step demonstrations with real-time interaction
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Multi-Language</h3>
                  <p className="text-sm text-gray-600">
                    Learn in your preferred language with 50+ language support
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <Button
          onClick={() => navigate('/profile')}
          size="sm"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <User className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => navigate('/analytics')}
          size="sm"
          variant="outline"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <BarChart3 className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => navigate('/avatar')}
          size="sm"
          variant="outline"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
