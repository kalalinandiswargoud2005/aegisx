import React from 'react';
import { Activity, ShieldCheck, Server } from 'lucide-react';

export function Footer() {
  return (
    <footer className="flex h-12 items-center justify-between border-t border-border-color bg-surface/80 px-4 md:px-6 text-sm font-semibold text-white/70 backdrop-blur-md">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-success" />
          System Secure
        </span>
        <span className="flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          Global Agent Status: Online
        </span>
      </div>
      
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2">
          <Server size={18} />
          Server: eu-west-2
        </span>
        <span>Version 1.0.0-rc.4</span>
        <span className="hidden sm:inline">Build: a9f8b4c</span>
        <span>© 2026 ASTRA Enterprise</span>
      </div>
    </footer>
  );
}
