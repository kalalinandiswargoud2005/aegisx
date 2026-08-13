import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Cpu, Activity, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useNavigate } from 'react-router-dom';

export function ImmediateActionOverlay() {
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number>(10);

  // ── Subscribe to new incidents ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe('timeline', (payload: any) => {
      if (payload.event === 'NEW_INCIDENT') {
        const incident = payload.incident;
        const immediateAction =
          payload.immediateAction || 'Immediate Isolation & Containment Executed';

        setActiveAlert({ incident, immediateAction, timestamp: new Date().toLocaleTimeString() });
        setAutoCloseTimer(10);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  // ── Countdown timer — dismisses & navigates to recovery ──────────────────────
  useEffect(() => {
    if (!activeAlert) return;

    const interval = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveAlert(null);
            navigate('/recovery');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAlert, navigate]);

  if (!activeAlert) return null;

  const { incident, immediateAction, timestamp } = activeAlert;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">

      {/* Subtle green background glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-900 animate-pulse" />

      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      {/* ── Main card ── */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-emerald-500/60 bg-[#0B101D]/95 p-8 shadow-[0_0_80px_rgba(16,185,129,0.30)] z-10 flex flex-col gap-6 overflow-hidden">

        {/* ── Top banner ── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck size={28} />
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
            onClick={() => {
              setActiveAlert(null);
              navigate('/recovery');
            }}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Dismiss to Recovery Page"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── BIG GREEN Immediate Action Block ── */}
        <div className="p-6 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-center gap-6">

          {/* Pulsing icon */}
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/50 animate-pulse">
            <Zap size={40} />
          </div>

          <div className="flex-1 text-center md:text-left">
            {/* Label */}
            <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-1 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Immediate Response Action Executed
            </div>

            {/* Action title */}
            <h1 className="text-2xl md:text-3xl font-space font-extrabold text-white tracking-tight leading-tight">
              {immediateAction.replace('[Immediate Action] ', '')}
            </h1>

            {/* Sub-text */}
            <p className="text-sm text-emerald-400/80 mt-1 font-mono">
              ✔ Action completed — endpoint isolated to prevent lateral spread.
            </p>
          </div>
        </div>

        {/* ── Threat & AI details grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-white/40 font-mono uppercase">Detected Incident</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              {incident.name}
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                incident.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30' :
                incident.severity === 'HIGH'     ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                incident.severity === 'MEDIUM'   ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {incident.severity}
              </span>
            </div>
            <div className="text-xs text-white/60">Category: {incident.type}</div>
            <div className="text-xs text-white/50 font-mono">Target: {incident.target || 'SIMULATED-ENDPOINT'}</div>
          </div>

          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-emerald-400 font-mono uppercase flex items-center gap-1">
              <Cpu size={14} /> AI Security Analysis
            </div>
            <p className="text-xs text-white/80 leading-relaxed italic">
              "{incident.aiExplanation || 'Anomalous behavior detected. Automated mitigation rules activated immediately.'}"
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40 font-mono flex items-center gap-2">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            Auto-dismissing in {autoCloseTimer}s
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveAlert(null); navigate('/threats'); }}
            >
              View Threats Page
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 border-emerald-500"
              onClick={() => { setActiveAlert(null); navigate('/recovery'); }}
            >
              Go to Recovery Wizard <ArrowRight size={16} />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
