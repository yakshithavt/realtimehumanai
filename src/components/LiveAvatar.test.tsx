// Test file to verify LiveAvatar component works
import { render, screen } from '@testing-library/react';
import LiveAvatar from './LiveAvatar';

// Mock the global window object for testing
Object.defineProperty(window, 'HeyGenLiveAvatarSDK', {
  value: {
    LiveAvatarSession: class {
      constructor(token: string, config: any) {
        console.log('Mock LiveAvatarSession created');
      }
      on(event: string, callback: any) {
        console.log(`Mock event listener: ${event}`);
      }
      start() {
        return Promise.resolve();
      }
      stop() {
        return Promise.resolve();
      }
      speak(text: string) {
        return Promise.resolve();
      }
      attachVideo(element: HTMLVideoElement) {
        console.log('Mock video attached');
      }
    }
  },
  writable: true
});

describe('LiveAvatar Component', () => {
  it('renders without crashing', () => {
    render(<LiveAvatar />);
    expect(screen.getByText('🎭 Start Avatar')).toBeInTheDocument();
  });

  it('shows initial state', () => {
    render(<LiveAvatar />);
    expect(screen.getByText('⏸️ Avatar Inactive')).toBeInTheDocument();
    expect(screen.getByText('LiveAvatar will appear here')).toBeInTheDocument();
  });
});
