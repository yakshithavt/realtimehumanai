import React, { useState, useEffect } from 'react';

interface AvatarConfig {
  style: 'professional' | 'friendly' | 'technical' | 'creative' | 'energetic';
  voice: 'calm' | 'enthusiastic' | 'authoritative' | 'encouraging';
  language: string;
  appearance: {
    gender: 'male' | 'female' | 'neutral';
    age: 'young' | 'middle' | 'senior';
    ethnicity: 'diverse' | 'specific';
  };
}

interface TeachingSession {
  id: string;
  topic: string;
  mode: string;
  duration: number;
  engagement: number;
  questions: number;
}

export function AvatarSystem() {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    style: 'professional',
    voice: 'calm',
    language: 'en',
    appearance: {
      gender: 'neutral',
      age: 'middle',
      ethnicity: 'diverse'
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [sessions, setSessions] = useState<TeachingSession[]>([
    {
      id: '1',
      topic: 'Algebra Basics',
      mode: 'math_whiteboard',
      duration: 30,
      engagement: 85,
      questions: 12
    },
    {
      id: '2',
      topic: 'Arduino LED Circuit',
      mode: 'hardware_lab',
      duration: 45,
      engagement: 92,
      questions: 8
    }
  ]);

  const [testSpeech, setTestSpeech] = useState('Hello! I am your AI teacher avatar. How can I help you learn today?');

  const speakText = (text: string) => {
    setCurrentText(text);
    setIsSpeaking(true);
    
    // Simulate speech (in real app, this would use text-to-speech)
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const updateAvatarStyle = (style: AvatarConfig['style']) => {
    setAvatarConfig(prev => ({ ...prev, style }));
  };

  const updateVoice = (voice: AvatarConfig['voice']) => {
    setAvatarConfig(prev => ({ ...prev, voice }));
  };

  const updateLanguage = (language: string) => {
    setAvatarConfig(prev => ({ ...prev, language }));
  };

  const updateAppearance = (key: keyof AvatarConfig['appearance'], value: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value
      }
    }));
  };

  const getAvatarEmoji = () => {
    const styleEmojis = {
      professional: '👨‍🏫',
      friendly: '😊',
      technical: '👨‍🔬',
      creative: '🎨',
      energetic: '⚡'
    };
    
    const voiceEmojis = {
      calm: '😌',
      enthusiastic: '🎉',
      authoritative: '📚',
      encouraging: '💪'
    };
    
    return `${styleEmojis[avatarConfig.style]} ${voiceEmojis[avatarConfig.voice]}`;
  };

  const getStyleDescription = () => {
    const descriptions = {
      professional: 'Formal, knowledgeable, structured teaching approach',
      friendly: 'Warm, approachable, encouraging learning environment',
      technical: 'Precise, detailed, expert-level instruction',
      creative: 'Innovative, engaging, artistic teaching methods',
      energetic: 'Dynamic, enthusiastic, high-energy presentation'
    };
    
    return descriptions[avatarConfig.style];
  };

  const getVoiceDescription = () => {
    const descriptions = {
      calm: 'Soothing, measured, peaceful speaking style',
      enthusiastic: 'Excited, passionate, energetic delivery',
      authoritative: 'Confident, clear, expert-like presentation',
      encouraging: 'Supportive, motivating, positive reinforcement'
    };
    
    return descriptions[avatarConfig.voice];
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">🤖 Avatar System</h1>
        <p className="text-gray-600">Customize your AI teacher avatar appearance and behavior</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Avatar Preview */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Avatar Preview</h2>
            
            {/* Avatar Display */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">
                  {getAvatarEmoji()}
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2">Current Configuration</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Style:</strong> {avatarConfig.style}</p>
                    <p><strong>Voice:</strong> {avatarConfig.voice}</p>
                    <p><strong>Language:</strong> {avatarConfig.language}</p>
                    <p><strong>Gender:</strong> {avatarConfig.appearance.gender}</p>
                    <p><strong>Age:</strong> {avatarConfig.appearance.age}</p>
                  </div>
                </div>
                
                {/* Speech Display */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Speech Output</h4>
                    {isSpeaking && (
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">🔊</div>
                        <span className="text-sm text-blue-600">Speaking...</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded p-3 min-h-[60px] flex items-center justify-center">
                    <p className="text-center text-gray-700">{currentText || 'Ready to speak'}</p>
                  </div>
                </div>
                
                {/* Test Controls */}
                <div className="mt-4 space-y-2">
                  <textarea
                    value={testSpeech}
                    onChange={(e) => setTestSpeech(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    rows={2}
                    placeholder="Enter text to test speech..."
                  />
                  <button
                    onClick={() => speakText(testSpeech)}
                    disabled={isSpeaking}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSpeaking ? 'Speaking...' : '🎤 Test Speech'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="w-96 bg-white border-l p-6 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-6">Avatar Configuration</h3>
          
          {/* Teaching Style */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Teaching Style</h4>
            <div className="space-y-2">
              {Object.keys({
                professional: '👨‍🏫 Professional',
                friendly: '😊 Friendly',
                technical: '👨‍🔬 Technical',
                creative: '🎨 Creative',
                energetic: '⚡ Energetic'
              }).map((key, index) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="style"
                    checked={avatarConfig.style === key}
                    onChange={() => updateAvatarStyle(key as AvatarConfig['style'])}
                    className="rounded"
                  />
                  <span className="text-sm">{Object.values({
                    professional: '👨‍🏫 Professional',
                    friendly: '😊 Friendly',
                    technical: '👨‍🔬 Technical',
                    creative: '🎨 Creative',
                    energetic: '⚡ Energetic'
                  })[index]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">{getStyleDescription()}</p>
          </div>

          {/* Voice Tone */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Voice Tone</h4>
            <div className="space-y-2">
              {Object.keys({
                calm: '😌 Calm',
                enthusiastic: '🎉 Enthusiastic',
                authoritative: '📚 Authoritative',
                encouraging: '💪 Encouraging'
              }).map((key, index) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="voice"
                    checked={avatarConfig.voice === key}
                    onChange={() => updateVoice(key as AvatarConfig['voice'])}
                    className="rounded"
                  />
                  <span className="text-sm">{Object.values({
                    calm: '😌 Calm',
                    enthusiastic: '🎉 Enthusiastic',
                    authoritative: '📚 Authoritative',
                    encouraging: '💪 Encouraging'
                  })[index]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">{getVoiceDescription()}</p>
          </div>

          {/* Language */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Language</h4>
            <select
              value={avatarConfig.language}
              onChange={(e) => updateLanguage(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="zh">🇨🇳 Chinese</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="ar">🇸🇦 Arabic</option>
            </select>
          </div>

          {/* Appearance */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Appearance</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={avatarConfig.appearance.gender}
                onChange={(e) => updateAppearance('gender', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="neutral">Neutral</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Age</label>
              <select
                value={avatarConfig.appearance.age}
                onChange={(e) => updateAppearance('age', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="young">Young</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ethnicity</label>
              <select
                value={avatarConfig.appearance.ethnicity}
                onChange={(e) => updateAppearance('ethnicity', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="diverse">Diverse</option>
                <option value="specific">Specific</option>
              </select>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{session.topic}</p>
                      <p className="text-xs text-gray-600">{session.mode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{session.duration}min</p>
                      <p className="text-xs text-green-600">{session.engagement}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Configuration */}
          <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            💾 Save Configuration
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>🎭 Current Style:</strong> {avatarConfig.style}
          </div>
          <div>
            <strong>🎤 Voice Tone:</strong> {avatarConfig.voice}
          </div>
          <div>
            <strong>🌍 Language:</strong> {avatarConfig.language}
          </div>
        </div>
      </div>
    </div>
  );
}
