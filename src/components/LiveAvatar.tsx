import React, { useState, useRef } from 'react';
import { LiveAvatarSession } from '@heygen/liveavatar-web-sdk';

// Use the imported type directly
type LiveAvatarSessionType = InstanceType<typeof LiveAvatarSession>;

declare global {
  interface Window {
    HeyGenLiveAvatarSDK?: {
      LiveAvatarSession: any;
    };
  }
}

// Load the LiveAvatar SDK dynamically
const loadLiveAvatarSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.HeyGenLiveAvatarSDK) {
      resolve(window.HeyGenLiveAvatarSDK);
      return;
    }
    
    // Try multiple CDN sources
    const sources = [
      'https://cdn.jsdelivr.net/npm/@heygen/liveavatar-web-sdk@latest/dist/index.umd.js',
      'https://unpkg.com/@heygen/liveavatar-web-sdk@latest/dist/index.umd.js',
      'https://cdn.skypack.dev/npm/@heygen/liveavatar-web-sdk@latest/dist/index.umd.js'
    ];
    
    let attempt = 0;
    
    const tryNextSource = () => {
      if (attempt >= sources.length) {
        reject(new Error('All SDK sources failed to load'));
        return;
      }
      
      const script = document.createElement('script');
      script.src = sources[attempt];
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => {
        if (window.HeyGenLiveAvatarSDK) {
          console.log(`✅ LiveAvatar SDK loaded from: ${sources[attempt]}`);
          resolve(window.HeyGenLiveAvatarSDK);
        } else {
          console.warn(`SDK loaded but not found in window, trying next source...`);
          attempt++;
          setTimeout(tryNextSource, 1000);
        }
      };
      
      script.onerror = () => {
        console.error(`Failed to load from: ${sources[attempt]}`);
        attempt++;
        if (attempt < sources.length) {
          setTimeout(tryNextSource, 1000);
        } else {
          reject(new Error('All SDK sources failed to load'));
        }
      };
      
      document.head.appendChild(script);
    };
    
    tryNextSource();
  });
};

interface LiveAvatarState {
  isLoading: boolean;
  isAvatarActive: boolean;
  error: string | null;
  sessionInfo: {
    sessionId: string;
    sessionToken: string;
    liveKitUrl: string;
    liveKitToken: string;
  } | null;
}

export default function LiveAvatar() {
  const [state, setState] = useState<LiveAvatarState>({
    isLoading: false,
    isAvatarActive: false,
    error: null,
    sessionInfo: null
  });
  
  const [inputText, setInputText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const createSession = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    addLog('🔑 Creating LiveAvatar session...');

    try {
      const response = await fetch('http://localhost:8000/api/live-avatar/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success && data.session_token) {
        addLog(`✅ Session created: ${data.session_id}`);
        addLog(`🔑 Token: ${data.session_token.substring(0, 30)}...`);
        await startSession(data.session_token, data.session_id);
      } else {
        throw new Error(data.message || 'Session creation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const startSession = async (sessionToken: string, sessionId: string) => {
    addLog('🚀 Starting LiveAvatar session...');

    try {
      const response = await fetch('http://localhost:8000/api/live-avatar/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken })
      });
      
      const data = await response.json();
      
      if (data.success && data.livekit_url && data.livekit_token) {
        addLog(`✅ Session started successfully`);
        addLog(`🔗 LiveKit URL: ${data.livekit_url}`);
        
        setState(prev => ({
          ...prev,
          sessionInfo: {
            sessionId,
            sessionToken,
            liveKitUrl: data.livekit_url,
            liveKitToken: data.livekit_token
          }
        }));
        
        await initializeLiveAvatar(sessionToken);
      } else {
        throw new Error(data.message || 'Session start failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const initializeLiveAvatar = async (sessionToken: string) => {
    addLog('🎭 Initializing LiveAvatar SDK...');
    
    try {
      const userConfig = {
        voiceChat: true,
      };
      
      const session: any = new LiveAvatarSession(sessionToken, userConfig);
      sessionRef.current = session;

      // Set up event listeners
      session.on('sessionStarted', () => {
        addLog('🎭 Avatar started successfully!');
        setState(prev => ({ ...prev, isAvatarActive: true, isLoading: false }));
        
        // Attach video if available
        if (videoRef.current) {
          session.attachVideo(videoRef.current);
        }
      });
      
      session.on('sessionStopped', () => {
        addLog('⏹️ Avatar stopped');
        setState(prev => ({ ...prev, isAvatarActive: false }));
      });
      
      session.on('agentStartedSpeaking', () => {
        addLog('🗣️ Avatar is speaking...');
      });
      
      session.on('agentStoppedSpeaking', () => {
        addLog('🤫 Avatar finished speaking');
      });
      
      session.on('error', (error: any) => {
        addLog(`❌ Avatar error: ${error.message}`);
        setState(prev => ({ ...prev, error: error.message, isAvatarActive: false }));
      });
      
      session.on('connectionStateChanged', (state: string) => {
        addLog(`🔄 Connection state: ${state}`);
      });

      // Start the session
      await session.start();
      addLog('✅ LiveAvatar session is active!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'SDK initialization failed';
      addLog(`❌ Error: ${errorMessage}`);
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const sendText = async () => {
    if (!inputText.trim()) {
      addLog('❌ Please enter text to send');
      return;
    }

    if (!sessionRef.current || !state.isAvatarActive) {
      addLog('❌ Avatar is not active');
      return;
    }

    addLog(`📤 Sending: "${inputText}"`);

    try {
      await sessionRef.current.speak(inputText);
      addLog('✅ Text sent to avatar');
      setInputText(''); // Clear input
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send text';
      addLog(`❌ Error: ${errorMessage}`);
    }
  };

  const stopSession = async () => {
    if (!sessionRef.current) {
      addLog('❌ No active session to stop');
      return;
    }

    addLog('⏹️ Stopping LiveAvatar session...');
    
    try {
      await sessionRef.current.stop();
      sessionRef.current = null;
      setState(prev => ({
        ...prev,
        isAvatarActive: false,
        sessionInfo: null
      }));
      addLog('✅ Session stopped');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop session';
      addLog(`❌ Error: ${errorMessage}`);
    }
  };

  const listActiveSessions = async () => {
    addLog('📋 Listing active sessions...');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/list-sessions');
      const data = await response.json();
      
      if (data.success) {
        addLog(`📊 Found ${data.total_sessions} active sessions`);
        data.active_sessions.forEach((sessionId: string) => {
          addLog(`  • ${sessionId}`);
        });
      } else {
        addLog(`❌ Failed to list sessions: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error listing sessions: ${errorMessage}`);
    }
  };

  const stopAllSessions = async () => {
    addLog('⏹️ Stopping all active sessions...');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/stop-all-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.message}`);
        if (data.stopped_sessions.length > 0) {
          data.stopped_sessions.forEach((sessionId: string) => {
            addLog(`  • Stopped: ${sessionId}`);
          });
        }
        
        // Reset local state
        if (sessionRef.current) {
          sessionRef.current = null;
        }
        setState(prev => ({
          ...prev,
          isAvatarActive: false,
          sessionInfo: null
        }));
      } else {
        addLog(`❌ Failed to stop sessions: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error stopping sessions: ${errorMessage}`);
    }
  };

  const aggressiveTerminateSessions = async () => {
    addLog('⚡️ AGGRESSIVE TERMINATION (direct HeyGen API)...');
    addLog('🔍 This bypasses local tracking and goes straight to HeyGen');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/aggressive-terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.message}`);
        if (data.deleted_sessions.length > 0) {
          data.deleted_sessions.forEach((sessionId: string) => {
            addLog(`  ⚡️ Terminated: ${sessionId}`);
          });
        }
        
        // Reset local state completely
        if (sessionRef.current) {
          try {
            await sessionRef.current.stop();
          } catch (e) {
            // Ignore stop errors if session is already deleted
          }
          sessionRef.current = null;
        }
        
        setState(prev => ({
          ...prev,
          isAvatarActive: false,
          sessionInfo: null,
          error: null
        }));
        
        addLog('🎯 ALL sessions terminated - concurrency limit should be cleared!');
        addLog('💡 Now try creating a new session - it should work!');
      } else {
        addLog(`❌ Aggressive termination failed: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error during aggressive termination: ${errorMessage}`);
    }
  };

  const comprehensiveCleanupSessions = async () => {
    addLog('🧹 Starting comprehensive cleanup (lists ALL HeyGen sessions)...');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/comprehensive-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.message}`);
        addLog('🔧 This cleaned ALL sessions from HeyGen system');
        
        // Reset local state completely
        if (sessionRef.current) {
          try {
            await sessionRef.current.stop();
          } catch (e) {
            // Ignore stop errors if session is already deleted
          }
          sessionRef.current = null;
        }
        
        setState(prev => ({
          ...prev,
          isAvatarActive: false,
          sessionInfo: null,
          error: null
        }));
        
        addLog('🎯 Now try creating a new session - should work!');
      } else {
        addLog(`❌ Comprehensive cleanup failed: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error during comprehensive cleanup: ${errorMessage}`);
    }
  };

  const forceCleanupSessions = async () => {
    addLog('🔧 Force cleaning all sessions (aggressive mode)...');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/force-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.message}`);
        if (data.deleted_sessions.length > 0) {
          data.deleted_sessions.forEach((sessionId: string) => {
            addLog(`  • Force cleaned: ${sessionId}`);
          });
        }
        
        // Reset local state completely
        if (sessionRef.current) {
          try {
            await sessionRef.current.stop();
          } catch (e) {
            // Ignore stop errors if session is already deleted
          }
          sessionRef.current = null;
        }
        
        setState(prev => ({
          ...prev,
          isAvatarActive: false,
          sessionInfo: null,
          error: null
        }));
      } else {
        addLog(`❌ Force cleanup failed: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error during force cleanup: ${errorMessage}`);
    }
  };

  const deleteAllSessions = async () => {
    addLog('🗑️ Deleting all active sessions...');
    
    try {
      const response = await fetch('http://localhost:8000/api/sessions/delete-all-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.message}`);
        if (data.deleted_sessions.length > 0) {
          data.deleted_sessions.forEach((sessionId: string) => {
            addLog(`  • Deleted: ${sessionId}`);
          });
        }
        
        // Reset local state completely
        if (sessionRef.current) {
          try {
            await sessionRef.current.stop();
          } catch (e) {
            // Ignore stop errors if session is already deleted
          }
          sessionRef.current = null;
        }
        
        setState(prev => ({
          ...prev,
          isAvatarActive: false,
          sessionInfo: null,
          error: null
        }));
      } else {
        addLog(`❌ Failed to delete sessions: ${data.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error deleting sessions: ${errorMessage}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={createSession}
          disabled={state.isLoading || state.isAvatarActive}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Starting...' : '🎭 Start Avatar'}
        </button>
        
        <button
          onClick={stopSession}
          disabled={!state.isAvatarActive}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⏹️ Stop Avatar
        </button>
        
        <button
          onClick={listActiveSessions}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          📋 List Sessions
        </button>
        
        <button
          onClick={stopAllSessions}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          ⏹️ Stop All Sessions
        </button>
        
        <button
          onClick={aggressiveTerminateSessions}
          className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-black transition-colors"
        >
          ⚡️ Aggressive Terminate
        </button>
        
        <button
          onClick={comprehensiveCleanupSessions}
          className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
        >
          🧹 Comprehensive Cleanup
        </button>
        
        <button
          onClick={forceCleanupSessions}
          className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
        >
          🔧 Force Cleanup
        </button>
        
        <button
          onClick={deleteAllSessions}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          🗑️ Delete All Sessions
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Status */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${state.isAvatarActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium">
            {state.isAvatarActive ? '🎭 Avatar Active' : '⏸️ Avatar Inactive'}
          </span>
        </div>
        
        {state.sessionInfo && (
          <div className="text-sm text-gray-600">
            <div>Session ID: {state.sessionInfo.sessionId.substring(0, 8)}...</div>
            <div>LiveKit: Connected</div>
          </div>
        )}
        
        {state.error && (
          <div className="text-red-600 text-sm">
            Error: {state.error}
          </div>
        )}
      </div>

      {/* Video Display */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!state.isAvatarActive && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🎭</div>
              <div>LiveAvatar will appear here</div>
            </div>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
          }}
          placeholder="Enter text for avatar to speak..."
          disabled={!state.isAvatarActive}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendText}
          disabled={!state.isAvatarActive || !inputText.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🗣️ Speak
        </button>
      </div>

      {/* Logs */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500">Logs will appear here...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
