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
import { Analytics } from '@/pages/Analytics';
import { Reports } from '@/pages/Reports';
import { AIAssistant } from '@/pages/AIAssistant';
import { Settings } from '@/pages/Settings';
import { Simulation } from '@/pages/Simulation';
import { Documentation } from '@/pages/Documentation';
import { About } from '@/pages/About';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
