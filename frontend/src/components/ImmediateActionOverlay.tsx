import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Cpu, Activity, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useNavigate } from 'react-router-dom';

export function ImmediateActionOverlay() {
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number>(12);
  const [isDangerStage, setIsDangerStage] = useState<boolean>(true);

  // ── Subscribe to new incidents ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe('timeline', (payload: any) => {
      if (payload.event === 'NEW_INCIDENT') {
        const incident = payload.incident;
        const immediateAction =
          payload.immediateAction || 'Immediate Isolation & Containment Executed';

        setActiveAlert({ incident, immediateAction, timestamp: new Date().toLocaleTimeString() });
        setAutoCloseTimer(12);
        setIsDangerStage(true);

        // Transition from Red Danger to Green Resolved after 4 seconds
        setTimeout(() => {
          setIsDangerStage(false);
        }, 4000);
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

      {/* Dynamic background glow (Red Danger -> Green Resolved) */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ${
        isDangerStage 
          ? 'bg-gradient-to-r from-red-950 via-danger/40 to-red-950 animate-pulse' 
          : 'bg-gradient-to-r from-emerald-950 via-emerald-800/40 to-emerald-950 animate-pulse'
      }`} />

      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      {/* ── Main card ── */}
      <div className={`relative w-full max-w-3xl rounded-2xl border p-8 transition-all duration-700 z-10 flex flex-col gap-6 overflow-hidden bg-[#0B101D]/95 ${
        isDangerStage 
          ? 'border-danger/80 shadow-[0_0_90px_rgba(255,42,109,0.45)]' 
          : 'border-emerald-500/80 shadow-[0_0_90px_rgba(16,185,129,0.45)]'
      }`}>

        {/* ── Top banner ── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors duration-500 ${
              isDangerStage ? 'bg-danger/20 text-danger animate-bounce' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isDangerStage ? <ShieldCheck className="w-8 h-8 text-danger" /> : <ShieldCheck className="w-8 h-8 text-emerald-400" />}
            </div>
            <div>
              <h2 className={`text-xl font-space font-extrabold tracking-wide uppercase flex items-center gap-2 ${
                isDangerStage ? 'text-danger animate-pulse' : 'text-emerald-400'
              }`}>
                {isDangerStage ? '⚠️ DANGER DETECTED: ATTACK INTERCEPTED' : '✅ THREAT NEUTRALIZED & SYSTEM SECURED'}
              </h2>
              <p className="text-xs text-white/60 font-mono mt-0.5">
                TARGET LAPTOP ➔ KERNEL GUARD ➔ REAL-TIME MITIGATION [{timestamp}]
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveAlert(null);
              navigate('/recovery');
            }}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Dismiss Alert"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Dynamic Action Block (Red Danger -> Green Resolved) ── */}
        <div className={`p-6 rounded-xl border-2 transition-all duration-700 flex flex-col md:flex-row items-center gap-6 ${
          isDangerStage 
            ? 'bg-danger/15 border-danger/70 shadow-[0_0_35px_rgba(255,42,109,0.3)]' 
            : 'bg-emerald-500/15 border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
        }`}>

          {/* Pulsing icon */}
          <div className={`p-4 rounded-full shrink-0 border transition-all duration-500 ${
            isDangerStage 
              ? 'bg-danger/20 text-danger border-danger/60 animate-ping' 
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 animate-pulse'
          }`}>
            {isDangerStage ? <Zap size={40} /> : <ShieldCheck size={40} />}
          </div>

          <div className="flex-1 text-center md:text-left">
            {/* Label */}
            <div className={`text-xs font-bold tracking-widest uppercase mb-1 flex items-center gap-2 justify-center md:justify-start ${
              isDangerStage ? 'text-danger' : 'text-emerald-400'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isDangerStage ? 'bg-danger' : 'bg-emerald-400'}`} />
              {isDangerStage ? 'HIGH SEVERITY DANGER ALERT IN PROGRESS' : 'AUTOMATED RECOVERY COMPLETED'}
            </div>

            {/* Action title */}
            <h1 className="text-2xl md:text-3xl font-space font-extrabold text-white tracking-tight leading-tight">
              {isDangerStage 
                ? `Malicious Behavior Detected on ${incident.target || 'Target Laptop'}` 
                : immediateAction.replace('[Immediate Action] ', '')}
            </h1>

            {/* Sub-text */}
            <p className={`text-sm mt-1.5 font-mono font-bold ${isDangerStage ? 'text-danger/90' : 'text-emerald-400/90'}`}>
              {isDangerStage 
                ? '🛑 High-risk payload isolated — executing zero-touch recovery...' 
                : '✔ Threat payload terminated & endpoint volume snapshot restored!'}
            </p>
          </div>
        </div>

        {/* ── Step-by-Step Autonomous Recovery Tracker ── */}
        <div className="p-4 rounded-xl bg-surface/90 border border-white/10 space-y-3 font-mono text-xs">
          <div className="text-white/60 uppercase tracking-wider font-bold flex items-center justify-between">
            <span>⚡ Autonomous Recovery Steps Executed</span>
            <span className={isDangerStage ? 'text-danger animate-pulse' : 'text-emerald-400 font-bold'}>
              {isDangerStage ? 'RECOVERING...' : '✔ 100% SECURED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">1</span>
              <div>
                <div className="text-white font-bold">Wi-Fi & Network Adapter</div>
                <div className="text-emerald-400 text-[11px] font-mono">✔ ISOLATED (Wi-Fi Disabled)</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">2</span>
              <div>
                <div className="text-white font-bold">Malicious Process Tree</div>
                <div className="text-emerald-400 text-[11px] font-mono">✔ KILLED (PID Terminated)</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">3</span>
              <div>
                <div className="text-white font-bold">Malware Executable Payload</div>
                <div className="text-emerald-400 text-[11px] font-mono">✔ QUARANTINED to Vault</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/30 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">4</span>
              <div>
                <div className="text-white font-bold">Volume Shadow Snapshots</div>
                <div className="text-emerald-400 text-[11px] font-mono">✔ RESTORED (Clean State)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Threat details grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-white/40 font-mono uppercase">Target Endpoint & Incident</div>
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
            <div className="text-xs text-white/60">Threat Type: {incident.type}</div>
            <div className="text-xs text-white/50 font-mono">Target Host: {incident.target || 'TARGET-LAPTOP-01'}</div>
          </div>

          <div className="p-4 rounded-lg bg-surface/80 border border-border-color space-y-2">
            <div className="text-xs text-emerald-400 font-mono uppercase flex items-center gap-1">
              <Cpu size={14} /> AI Defense Analysis
            </div>
            <p className="text-xs text-white/80 leading-relaxed italic">
              "{incident.aiExplanation || 'Anomalous payload behavior intercepted. Kernel-level mitigation activated.'}"
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40 font-mono flex items-center gap-2">
            <Activity size={14} className="text-primary animate-pulse" />
            Auto-closing in {autoCloseTimer}s
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveAlert(null); navigate('/threats'); }}
            >
              View Threat Center
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 border-emerald-500 font-bold"
              onClick={() => { setActiveAlert(null); navigate('/recovery'); }}
            >
              Open Recovery Wizard <ArrowRight size={16} />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
