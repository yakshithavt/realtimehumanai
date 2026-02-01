import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { TeachingDashboard } from '@/components/TeachingDashboard';
import { HardwareLab } from '@/components/HardwareLab';
import { MathWhiteboard } from '@/components/MathWhiteboard';
import { ScienceSimulation } from '@/components/ScienceSimulation';
import { CodingWorkshop } from '@/components/CodingWorkshop';
import { AvatarSystem } from '@/components/AvatarSystem';
import { StudentProfile } from '@/components/StudentProfile';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Layout } from '@/components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ai-teacher-theme">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<TeachingDashboard />} />
              <Route path="/hardware" element={<HardwareLab />} />
              <Route path="/math" element={<MathWhiteboard />} />
              <Route path="/science" element={<ScienceSimulation />} />
              <Route path="/coding" element={<CodingWorkshop />} />
              <Route path="/avatar" element={<AvatarSystem />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
