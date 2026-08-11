/**
 * ThreatAlertModal.tsx
 *
 * Full-screen RED threat alert popup — single phase, 15 seconds.
 * Shows threat details + immediate action checklist in one screen.
 * After 15 s it auto-dismisses (no second/green popup).
 *
 * Also exports ResolvedToast + ResolvedToastContainer for the small
 * bottom-right notification when a threat is auto-resolved.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  X,
  Zap,
  Clock,
  CheckCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThreatAlertPayload {
  id: string;
  severity: string;
  type: string;
  target: string;
  name?: string;
  timestamp: string;
}

export interface ResolvedToastPayload {
  id: string;
  name: string;
}

// ── Duration ──────────────────────────────────────────────────────────────────

const POPUP_DURATION = 5; // seconds before auto-dismiss

// ── Severity accent colour ────────────────────────────────────────────────────

function severityAccent(severity: string) {
  switch ((severity || '').toUpperCase()) {
    case 'CRITICAL': return { border: 'rgba(220,38,38,.90)', glow: 'rgba(220,38,38,.65)', text: '#ef4444', bg: 'rgba(239,68,68,.10)' };
    case 'HIGH':     return { border: 'rgba(249,115,22,.85)', glow: 'rgba(249,115,22,.50)', text: '#f97316', bg: 'rgba(249,115,22,.10)' };
    case 'MEDIUM':   return { border: 'rgba(234,179,8,.80)',  glow: 'rgba(234,179,8,.45)', text: '#eab308', bg: 'rgba(234,179,8,.10)'  };
    default:         return { border: 'rgba(34,197,94,.75)',  glow: 'rgba(34,197,94,.40)', text: '#22c55e', bg: 'rgba(34,197,94,.10)'  };
  }
}

// ── Immediate actions list ────────────────────────────────────────────────────

const IMMEDIATE_ACTIONS = [
  'Isolate the affected endpoint immediately',
  'Preserve system logs and memory dumps',
  'Block suspicious network traffic at the firewall',
  'Reset credentials of affected accounts',
  'Open the AEGISX Recovery Wizard to finalise recovery',
];

// ═══════════════════════════════════════════════════════════════════════════════
//  FULL-SCREEN THREAT ALERT MODAL  (single red popup)
// ═══════════════════════════════════════════════════════════════════════════════

interface ThreatAlertModalProps {
  threat: ThreatAlertPayload | null;
  onDismiss: () => void;
}

export const ThreatAlertModal: React.FC<ThreatAlertModalProps> = ({
  threat,
  onDismiss,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  /* Reset on new threat */
  useEffect(() => {
    if (!threat) return;
    setElapsed(0);
  }, [threat?.id]);

  /* Countdown tick */
  useEffect(() => {
    if (!threat) return;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= POPUP_DURATION) {
          clearInterval(timer);
          setTimeout(() => onDismissRef.current(), 0);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [threat?.id]);

  if (!threat) return null;

  const accent      = severityAccent(threat.severity);
  const remaining   = POPUP_DURATION - elapsed;
  const progressPct = (elapsed / POPUP_DURATION) * 100;

  return (
    <>
      <style>{`
        @keyframes aegisx-modal-in {
          from { opacity:0; transform:scale(.96); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes aegisx-vignette-pulse {
          0%,100% { opacity:.65; } 50% { opacity:1; }
        }
        @keyframes aegisx-card-glow {
          0%,100% { box-shadow: 0 0 55px ${accent.glow}, 0 0 110px ${accent.glow.replace('.65','.20')}; }
          50%      { box-shadow: 0 0 85px ${accent.glow}, 0 0 170px ${accent.glow.replace('.65','.35')}; }
        }
        @keyframes aegisx-title-flash {
          0%,100% { opacity:1; } 50% { opacity:.72; }
        }
        @keyframes aegisx-icon-beat {
          0%,100% { transform:scale(1); } 50% { transform:scale(1.08); }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          background: 'rgba(0,0,0,.90)',
          backdropFilter: 'blur(8px)',
          animation: 'aegisx-modal-in .3s ease',
        }}
      >
        {/* Colour vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 22%, ${accent.border.replace('.90','.30')} 100%)`,
            animation: 'aegisx-vignette-pulse 1.6s ease-in-out infinite',
          }}
        />

        {/* ── Card ── */}
        <div
          className="relative w-full max-w-lg mx-4 flex flex-col"
          style={{
            background: 'linear-gradient(145deg,#160000 0%,#0c0000 100%)',
            border: `2px solid ${accent.border}`,
            animation: 'aegisx-card-glow 1.6s ease-in-out infinite',
            clipPath: 'polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 z-10 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: accent.text }}
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── Header ── */}
          <div
            className="px-6 pt-5 pb-4 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${accent.border.replace('.90','.25')}` }}
          >
            {/* Icon */}
            <div
              style={{
                width: 50, height: 50, flexShrink: 0,
                background: accent.bg,
                border: `1.5px solid ${accent.border.replace('.90','.65')}`,
                clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'aegisx-icon-beat 1.3s ease-in-out infinite',
              }}
            >
              <AlertTriangle style={{ width: 24, height: 24, color: accent.text }} />
            </div>

            <div>
              <div className="text-[10px] font-mono tracking-[.28em] uppercase mb-0.5" style={{ color: `${accent.text}99` }}>
                AEGISX CYBER DEFENSE · LIVE ALERT
              </div>
              <h2
                className="text-2xl font-black font-mono tracking-widest uppercase leading-none"
                style={{
                  color: accent.text,
                  textShadow: `0 0 22px ${accent.glow}`,
                  animation: 'aegisx-title-flash 1.2s ease-in-out infinite',
                }}
              >
                ⚠ THREAT DETECTED
              </h2>
            </div>
          </div>

          {/* ── Threat details ── */}
          <div className="px-6 pt-4 flex-shrink-0">
            {/* Severity badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-mono font-black tracking-[.22em] uppercase px-3 py-1"
                style={{
                  color: accent.text,
                  background: accent.bg,
                  border: `1px solid ${accent.border.replace('.90','.55')}`,
                  clipPath: 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))',
                }}
              >
                {threat.severity}
              </span>
              <span className="text-[10px] font-mono" style={{ color: `${accent.text}70` }}>{threat.timestamp}</span>
            </div>

            {/* Info rows */}
            <div
              className="p-3 mb-3 font-mono space-y-1.5"
              style={{ background: accent.bg, border: `1px solid ${accent.border.replace('.90','.20')}` }}
            >
              {[
                ['TYPE',   threat.type   || 'Unknown'],
                ['TARGET', threat.target || 'Unknown'],
                ['NAME',   threat.name   || threat.type || 'N/A'],
                ['ID',     threat.id],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-xs w-14 flex-shrink-0" style={{ color: `${accent.text}70` }}>{label}</span>
                  <span className="text-xs font-semibold text-white/90 break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Immediate action checklist ── */}
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: `${accent.text}99` }}>
              ⚡ IMMEDIATE ACTIONS REQUIRED
            </div>
            <div className="space-y-1.5">
              {IMMEDIATE_ACTIONS.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: accent.text }} />
                  <span className="text-xs font-mono text-white/80">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Countdown bar ── */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: `${accent.text}70` }}>
                <Clock className="w-3 h-3" />
                <span>AUTO-DISMISS IN</span>
              </div>
              <span className="text-sm font-black font-mono" style={{ color: accent.text }}>{remaining}s</span>
            </div>
            <div className="w-full h-1.5 overflow-hidden" style={{ background: `${accent.text}18` }}>
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${100 - progressPct}%`,
                  background: `linear-gradient(90deg, ${accent.border.replace('.90','1').replace('rgba','rgb').replace(',1)',')')}, ${accent.text})`,
                  boxShadow: `0 0 10px ${accent.glow}`,
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SMALL "THREAT RESOLVED" TOAST  (bottom-right)
// ═══════════════════════════════════════════════════════════════════════════════

interface ResolvedToastProps {
  item: ResolvedToastPayload;
  onClose: (id: string) => void;
}

const ResolvedToast: React.FC<ResolvedToastProps> = ({ item, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 40);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(item.id), 400);
    }, 3000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [item.id, onClose]);

  return (
    <div
      style={{
        transition: 'opacity .35s ease, transform .35s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        background: 'linear-gradient(135deg,#00160c,#001008)',
        border: '1.5px solid rgba(16,185,129,.65)',
        boxShadow: '0 0 22px rgba(16,185,129,.35)',
        clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 260,
        maxWidth: 340,
        pointerEvents: 'all',
      }}
    >
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-400/70">Threat Resolved</div>
        <div className="text-xs font-bold text-emerald-200 font-mono truncate">{item.name}</div>
      </div>
      <button onClick={() => onClose(item.id)} className="text-emerald-400/50 hover:text-emerald-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Toast container ────────────────────────────────────────────────────────────

interface ResolvedToastContainerProps {
  items: ResolvedToastPayload[];
  onClose: (id: string) => void;
}

export const ResolvedToastContainer: React.FC<ResolvedToastContainerProps> = ({ items, onClose }) => {
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-2 pointer-events-none" style={{ alignItems: 'flex-end' }}>
      {items.map((item) => (
        <ResolvedToast key={item.id} item={item} onClose={onClose} />
      ))}
    </div>
  );
};

export default ThreatAlertModal;
