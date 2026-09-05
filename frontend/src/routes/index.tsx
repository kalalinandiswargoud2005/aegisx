import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { Login } from '@/pages/Login';
import { Landing } from '@/pages/Landing';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Threats } from '@/pages/Threats';
import { Devices } from '@/pages/Devices';
import { DeviceDetail } from '@/pages/DeviceDetail';
import { Watch } from '@/pages/Watch';
import { Recovery } from '@/pages/Recovery';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Attacks } from '@/pages/Attacks';
import { About } from '@/pages/About';
import { AssistantPage } from '@/features/assistant/AssistantPage';
import { MobileRemote } from '@/pages/MobileRemote';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Standalone Mobile Cyber Remote Route */}
      <Route path="/remote" element={<MobileRemote />} />
      <Route path="/mobile" element={<MobileRemote />} />
      
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/analytics" element={<Reports />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/simulation" element={<Attacks />} />
          <Route path="/ai-assistant" element={<AssistantPage isGlobalMode={false} />} />
          <Route path="/docs" element={<Navigate to="/reports" replace />} />
          <Route path="/about" element={<About />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
