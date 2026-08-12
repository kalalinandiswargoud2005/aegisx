import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ImmediateActionOverlay } from '@/components/ImmediateActionOverlay';

export function MainLayout() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-white">
      <ImmediateActionOverlay />

      {/* Background Layer */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative z-10 w-full min-w-0">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
