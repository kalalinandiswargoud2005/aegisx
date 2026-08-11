/**
 * Simulation.tsx
 *
 * Threat Simulation Engine page.
 * Added: Live "Immediate Actions" log column — shows every triggered action
 * in green as threats arrive via WebSocket.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Square, Zap, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import { Card, Button, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/providers/WebSocketProvider';
import api from '@/lib/api';
import { toast } from 'sonner';

// ── Immediate action per threat type ─────────────────────────────────────────

const IMMEDIATE_ACTION_MAP: Record<string, string> = {
  RANSOMWARE:              'Isolated endpoint & terminated malicious process',
  'SQL_INJECTION':         'Blocked attack IP & sanitised database inputs',
  'BRUTE_FORCE':           'Locked account & enforced MFA challenge',
  'DDoS':                  'Rate-limiting applied & traffic scrubbing active',
  'MAN_IN_THE_MIDDLE':     'Terminated session & rotated TLS certificates',
  'ZERO_DAY':              'Applied virtual patch & alerted security team',
  'PHISHING':              'Quarantined email & revoked credential session',
  'INSIDER_THREAT':        'Suspended user account & alerted CISO',
  'DATA_EXFILTRATION':     'Blocked outbound channel & preserved memory dump',
  'PRIVILEGE_ESCALATION':  'Reverted privilege & locked compromised account',
  'MALWARE':               'Quarantined process & triggered AV deep scan',
  'PORT_SCAN':             'Blocked scanning IP & tightened firewall rules',
  DEFAULT:                 'Isolated affected system & initiated recovery',
};

function getImmediateAction(type: string): string {
  const key = (type || '').toUpperCase().replace(/[\s-]/g, '_');
  return IMMEDIATE_ACTION_MAP[key] || IMMEDIATE_ACTION_MAP.DEFAULT;
}

// ── Severity colour helper ────────────────────────────────────────────────────

function severityClass(severity: string) {
  switch ((severity || '').toUpperCase()) {
    case 'CRITICAL': return 'text-red-400   border-red-500/40   bg-red-500/10';
    case 'HIGH':     return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    case 'MEDIUM':   return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
    default:         return 'text-green-400  border-green-500/40  bg-green-500/10';
  }
}

// ── Action log entry ──────────────────────────────────────────────────────────

interface ActionEntry {
  id: string;
  time: string;
  threatName: string;
  threatType: string;
  severity: string;
  action: string;
}

// ═══════════════════════════════════════════════════════════════════════════════

export function Simulation() {
  const { subscribe } = useWebSocket();

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await api.get('/simulation/scenarios');
      return res.data;
    },
  });

  // ── Live action log ──────────────────────────────────────────────────────
  const [actionLog, setActionLog] = useState<ActionEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribe('threats', (incident: any) => {
      const entry: ActionEntry = {
        id:         String(incident.id || Date.now()),
        time:       new Date().toLocaleTimeString('en-US'),
        threatName: incident.name || incident.type || 'Unknown Threat',
        threatType: incident.type || 'UNKNOWN',
        severity:   incident.severity || 'LOW',
        action:     getImmediateAction(incident.type || ''),
      };
      setActionLog((prev) => [entry, ...prev].slice(0, 50));
    });
    return () => unsubscribe();
  }, [subscribe]);

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLog.length]);

  return (
    <PageContainer>
      <PageHeader
        title="Threat Simulator"
        description="Generate and test AI-backed security incidents."
      />

      {/* ── Controls + Action log side-by-side ── */}
      <PageSection className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: controls */}
        <div className="space-y-6">

          {/* Engine card */}
          <Card className="border-primary/30 bg-primary/5">
            <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Enterprise Threat Simulation Engine
            </h3>
            <p className="text-sm text-white/70 mb-6">
              Control the Enterprise Threat Simulation Engine for demonstrations and testing.
              Activating Continuous Demo Mode will generate AI-backed security incidents every 15 seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.post('/simulation/demo/start');
                    toast.success('Simulation Engine Started');
                  } catch {
                    toast.error('Failed to start Simulation Engine');
                  }
                }}
              >
                <Play size={16} />
                Start Continuous Simulation
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.post('/simulation/demo/stop');
                    toast.info('Simulation Engine Stopped');
                  } catch {
                    toast.error('Failed to stop Simulation Engine');
                  }
                }}
              >
                <Square size={16} />
                Stop Simulation
              </Button>
              <Button
                variant="outline"
                className="border-danger/50 text-danger hover:bg-danger/10 flex items-center gap-2"
                onClick={async () => {
                  try {
                    await api.post('/simulation/trigger/random');
                    toast.success('Triggered random scenario');
                  } catch {
                    toast.error('Failed to trigger scenario');
                  }
                }}
              >
                <Zap size={16} />
                Trigger Single Threat
              </Button>
            </div>
          </Card>

          {/* How it works */}
          <Card>
            <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2">How it works</h3>
            <div className="space-y-4 text-sm text-white/70">
              <p>The Simulation Engine bypasses real hardware endpoints and directly injects synthetically generated security incidents into the platform.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Continuous Simulation:</strong> Automatically picks a random threat scenario every 15 seconds and dispatches it over WebSockets.</li>
                <li><strong>Single Threat:</strong> Instantly fires one random scenario for immediate testing.</li>
                <li><strong>Manual Trigger:</strong> Use the Threat Library to trigger a specific scenario.</li>
                <li><strong>Immediate Action:</strong> Every incoming threat triggers an automated immediate-action response shown live in the green log.</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Right: live green action log */}
        <Card className="flex flex-col border-green-500/25 bg-green-500/5" style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between mb-4 border-b border-border-color pb-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Activity size={18} className="text-green-400" />
              Live Immediate Actions
              {actionLog.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {actionLog.length}
                </span>
              )}
            </h3>
            {actionLog.length > 0 && (
              <button
                onClick={() => setActionLog([])}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
                title="Clear log"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 520 }}>
            {actionLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/30">
                <ShieldAlert size={32} className="opacity-30" />
                <p className="text-sm font-mono">Waiting for threat events…</p>
                <p className="text-xs">Trigger a simulation above to see live actions</p>
              </div>
            ) : (
              actionLog.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-none font-mono text-xs space-y-1.5 border-l-2 border-green-500"
                  style={{
                    background: 'rgba(16,185,129,0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  }}
                >
                  {/* Row 1: time + severity + threat name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-green-400/60">[{entry.time}]</span>
                    <span
                      className={`px-1.5 py-0 text-[9px] font-black tracking-widest border rounded-none ${severityClass(entry.severity)}`}
                    >
                      {entry.severity}
                    </span>
                    <span className="text-white/80 font-semibold truncate">{entry.threatName}</span>
                  </div>

                  {/* Row 2: action taken */}
                  <div className="flex items-start gap-2">
                    <CheckCircle size={11} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-green-300 leading-relaxed">{entry.action}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </Card>

      </PageSection>

      {/* ── Threat Library ── */}
      <PageSection>
        <Card>
          <h3 className="mb-4 text-lg font-medium text-white border-b border-border-color pb-2">
            Threat Library ({scenarios?.length || 0})
          </h3>
          <p className="text-sm text-white/70 mb-4">
            Manually trigger specific high-level threat scenarios for testing and demonstration.
          </p>

          {isLoading ? (
            <div className="flex justify-center p-8 text-primary">
              <span className="animate-pulse">Loading scenarios...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios?.map((scenario: any) => (
                <div
                  key={scenario.threatId}
                  className="bg-surface/50 border border-border-color rounded-none p-4 flex flex-col justify-between"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium text-sm truncate pr-2" title={scenario.threatName}>
                        {scenario.threatName}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        scenario.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/30' :
                        scenario.severity === 'HIGH'     ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        scenario.severity === 'MEDIUM'   ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                           'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2">{scenario.category}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
                    onClick={async () => {
                      try {
                        await api.post(`/simulation/trigger/${scenario.threatId}`);
                        toast.success(`Triggered: ${scenario.threatName}`);
                      } catch {
                        toast.error('Failed to trigger scenario');
                      }
                    }}
                  >
                    <Zap size={14} />
                    Trigger Threat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageSection>
    </PageContainer>
  );
}
