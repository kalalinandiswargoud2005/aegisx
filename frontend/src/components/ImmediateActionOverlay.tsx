import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Cpu, Activity, ArrowRight, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useNavigate } from 'react-router-dom';

export function ImmediateActionOverlay() {
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number>(10);

  useEffect(() => {
    const unsubscribe = subscribe('timeline', (payload: any) => {
      if (payload.event === 'NEW_INCIDENT') {
        const incident = payload.incident;
        const immediateAction = payload.immediateAction || 'Immediate Isolation & Containment Executed';
        
        setActiveAlert({
          incident,
          immediateAction,
          timestamp: new Date().toLocaleTimeString()
        });
        setAutoCloseTimer(10);
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  useEffect(() => {
    if (!activeAlert) return;
    const interval = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAlert]);

  if (!activeAlert) return null;

  const { incident, immediateAction, timestamp } = activeAlert;
  const isCritical = incident.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background Animated Glow Effects */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${
        isCritical ? 'bg-gradient-to-r from-danger via-red-900 to-danger animate-pulse' : 'bg-gradient-to-r from-orange-600 via-yellow-700 to-orange-600'
      }`} />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Main Alert Card Box */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-danger/60 bg-[#0B101D]/95 p-8 shadow-[0_0_80px_rgba(255,61,113,0.3)] z-10 flex flex-col gap-6 overflow-hidden">
        
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger/20 text-danger animate-ping">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-xl font-space font-bold text-white tracking-wide uppercase flex items-center gap-2">
                Automated Immediate Response Triggered
              </h2>
              <p className="text-xs text-white/50 font-mono">
                AGENT ➔ HARDWARE ALERT ➔ AI ANALYSIS ➔ AUTOMATED CONTAINMENT [{timestamp}]
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveAlert(null)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Immediate Action Block - Full Display Focus */}
        <div className="p-6 rounded-xl bg-danger/15 border-2 border-danger/50 shadow-[0_0_30px_rgba(255,61,113,0.2)] flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-full bg-danger/20 text-danger shrink-0 border border-danger/40 animate-pulse">
            <Zap size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs font-bold tracking-widest text-danger uppercase mb-1 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
              Immediate Response Action Executed
            </div>
            <h1 className="text-2xl md:text-3xl font-space font-extrabold text-white tracking-tight leading-tight">
              {immediateAction.replace('[Immediate Action] ', '')}
            </h1>
            <p className="text-sm text-danger/80 mt-1 font-mono">
              Hardware status: Disconnected / Isolated to prevent lateral spread.
            </p>
          </div>
        </div>

        {/* Threat & AI Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-white/40 font-mono uppercase">Detected Incident</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              {incident.name}
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                incident.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30' :
                'bg-orange-500/20 text-orange-500 border border-orange-500/30'
              }`}>
                {incident.severity}
              </span>
            </div>
            <div className="text-xs text-white/60">Category: {incident.type}</div>
            <div className="text-xs text-white/50 font-mono">Target: {incident.target || 'SIMULATED-ENDPOINT'}</div>
          </div>

          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-primary font-mono uppercase flex items-center gap-1">
              <Cpu size={14} /> AI Security Analysis
            </div>
            <p className="text-xs text-white/80 leading-relaxed italic">
              "{incident.aiExplanation || 'Anomalous behavior detected. Automated mitigation rules activated immediately.'}"
            </p>
          </div>
        </div>

        {/* Footer Actions & Timer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40 font-mono flex items-center gap-2">
            <Activity size={14} className="text-accent animate-pulse" />
            Auto-dismissing in {autoCloseTimer}s
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveAlert(null);
                navigate('/threats');
              }}
            >
              View Threats Page
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-danger hover:bg-danger/80 text-white flex items-center gap-2"
              onClick={() => {
                setActiveAlert(null);
                navigate('/recovery');
              }}
            >
              Go to Recovery Wizard <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
