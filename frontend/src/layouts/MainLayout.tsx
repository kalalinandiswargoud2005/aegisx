import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ImmediateActionOverlay } from '@/components/ImmediateActionOverlay';
import { CyberBackground } from '@/components/ui/CyberBackground';
import { GlobalAssistantDrawer } from '@/components/GlobalAssistantDrawer';

export function MainLayout() {
  return (
    <div className="relative flex h-screen w-full p-4 overflow-hidden bg-background text-primary">
      <ImmediateActionOverlay />

      {/* Background Layer */}
      <CyberBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black pointer-events-none z-0" />

      {/* Agency Console Frame */}
      <div className="relative z-10 flex flex-1 overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(0,255,65,0.1)] bg-black/70 backdrop-blur-md">
        {/* Frame Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary pointer-events-none z-50"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary pointer-events-none z-50"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary pointer-events-none z-50"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary pointer-events-none z-50"></div>
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col relative z-20 w-full min-w-0">
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-6">
            <Outlet />
          </main>
          
          <Footer />
        </div>
      </div>
      <GlobalAssistantDrawer />
    </div>
  );
}
