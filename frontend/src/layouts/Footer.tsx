import React from 'react';
import { Activity, ShieldCheck, Server } from 'lucide-react';

export function Footer() {
  return (
    <footer className="flex h-10 items-center justify-between border-t border-border-color bg-surface/80 px-6 text-xs text-white/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          System Secure
        </span>
        <span className="flex items-center gap-1.5">
          <Activity size={14} className="text-primary" />
          Global Agent Status: Online
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Server size={14} />
          Server: eu-west-2
        </span>
        <span>Version 1.0.0-rc.4</span>
        <span>Build: a9f8b4c</span>
        <span>© 2026 AEGISX Enterprise</span>
      </div>
    </footer>
  );
}
