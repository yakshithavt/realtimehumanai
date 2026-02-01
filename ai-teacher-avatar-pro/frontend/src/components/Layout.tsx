import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🎓 AI Teacher Avatar Pro</h1>
            </div>
            <nav className="flex space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Dashboard</button>
              <button className="text-gray-600 hover:text-gray-900">Profile</button>
              <button className="text-gray-600 hover:text-gray-900">Settings</button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
