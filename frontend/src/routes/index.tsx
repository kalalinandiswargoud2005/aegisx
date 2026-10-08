import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { Login } from '@/pages/Login';
import { Landing } from '@/pages/Landing';
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
import { CollegeLogoPage } from '@/pages/CollegeLogoPage';
import { AstraCinematicDemo } from '@/pages/AstraCinematicDemo';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/college-logo" element={<CollegeLogoPage />} />
      <Route path="/mru-logo" element={<Navigate to="/college-logo" replace />} />
      <Route path="/cinematic-demo" element={<AstraCinematicDemo />} />
      <Route path="/video" element={<AstraCinematicDemo />} />
      <Route path="/demo-video" element={<AstraCinematicDemo />} />
      
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
          <Route path="/college-logo" element={<CollegeLogoPage />} />
          <Route path="/mru-logo" element={<Navigate to="/college-logo" replace />} />
          <Route path="/institution" element={<Navigate to="/college-logo" replace />} />
          <Route path="/cinematic" element={<Navigate to="/cinematic-demo" replace />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

