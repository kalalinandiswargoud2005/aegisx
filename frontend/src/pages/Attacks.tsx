/**
 * Attacks.tsx
 *
 * Threat Simulation & Real Endpoint Defensive Remediation Control Center.
 * Supports:
 * - Explicit target device selection
 * - Safe sandbox live attacks (ASTRA_END_TO_END_SAFE_TEST, Simulated Ransomware, Registry Hijack, Backdoor Port, Lateral Movement, Data Exfiltration)
 * - Real Defensive Remediation Operations (DISABLE_RDP, RESTORE_FIREWALL, ENABLE_REALTIME, FINAL_VERIFICATION)
 * - Real-time command status pipeline: QUEUED -> DELIVERED -> EXECUTING -> VERIFYING -> VERIFIED SUCCESS / FAILED
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Play, Zap, ShieldAlert, CheckCircle, Trash2, ShieldCheck, Terminal, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import { Card, Button, PageContainer, PageHeader, PageSection, Badge } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/providers/WebSocketProvider';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useScopedDevice } from '@/contexts/ScopedDeviceContext';
import { MobileRemoteModal } from '@/components/MobileRemoteModal';

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

function severityClass(severity: string) {
  switch ((severity || '').toUpperCase()) {
    case 'CRITICAL': return 'text-red-400 border-red-500/40 bg-red-500/10';
    case 'HIGH':     return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
    case 'MEDIUM':   return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
    default:         return 'text-green-400 border-green-500/40 bg-green-500/10';
  }
}

interface ActionEntry {
  id: string;
  time: string;
  threatName: string;
  threatType: string;
  severity: string;
  action: string;
}

interface CommandStatusEntry {
  commandId: string;
  deviceId: string;
  commandType: string;
  target?: string;
  status: string;
  result?: string;
  timestamp: string;
}

export function Attacks() {
  const { subscribe } = useWebSocket();
  const { scopedDeviceId } = useScopedDevice();

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await api.get('/simulation/scenarios');
      return res.data;
    },
  });

  const { data: devices = [], refetch: refetchDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'LIVE' | 'REMEDIATION' | 'SCRIPTED'>('LIVE');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // ── Live action log ──────────────────────────────────────────────────────
  const [actionLog, setActionLog] = useState<ActionEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ── Command Pipeline Status ──────────────────────────────────────────────
  const [commandQueue, setCommandQueue] = useState<CommandStatusEntry[]>([]);

  // Selected device
  const targetDevice = devices.find((d: any) => d.id === selectedDevice) || 
                       devices.find((d: any) => d.status === 'ONLINE') || null;

  const targetDeviceId = targetDevice?.id;
  const isTargetOnline = targetDevice?.status === 'ONLINE';

  // Auto-select online device on load
  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      const online = devices.find((d: any) => d.status === 'ONLINE');
      if (online) {
        setSelectedDevice(online.id);
      }
    }
  }, [devices, selectedDevice]);

  // WebSocket subscriptions for Threats and Commands
  useEffect(() => {
    // 1. Threat notifications
    const unsubThreats = subscribe('threats', (incident: any) => {
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

    // 2. Command lifecycle updates
    const unsubCommands = subscribe('commands', (event: any) => {
      if (!event || !event.commandId) return;
      setCommandQueue((prev) => {
        const existingIdx = prev.findIndex(c => c.commandId === event.commandId);
        const entry: CommandStatusEntry = {
          commandId: event.commandId,
          deviceId: event.deviceId || '',
          commandType: event.commandType || 'COMMAND',
          status: event.status || 'DELIVERED',
          result: event.result,
          timestamp: new Date().toLocaleTimeString('en-US'),
        };
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = { ...copy[existingIdx], ...entry };
          return copy;
        } else {
          return [entry, ...prev].slice(0, 20);
        }
      });
    });

    return () => {
      unsubThreats();
      unsubCommands();
    };
  }, [subscribe]);

  // Execute direct command helper
  const sendDirectCommand = async (commandType: string, target?: string) => {
    if (!targetDeviceId) {
      toast.error('No target device available. Ensure ASTRA Windows Agent is connected.');
      return;
    }
    if (!isTargetOnline) {
      toast.error(`TARGET OFFLINE — Device "${targetDevice?.name}" is not currently connected.`);
      return;
    }

    try {
      const payload: any = { commandType };
      if (target) payload.target = target;

      const res = await api.post(`/devices/${targetDeviceId}/command`, payload);
      
      const localCmdId = 'CMD-' + Date.now();
      setCommandQueue(prev => [
        {
          commandId: localCmdId,
          deviceId: targetDeviceId,
          commandType,
          target,
          status: 'QUEUED',
          timestamp: new Date().toLocaleTimeString('en-US'),
        },
        ...prev,
      ].slice(0, 20));

      toast.success(`Dispatched ${commandType} to ${targetDevice?.name || 'endpoint'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to dispatch ${commandType}`);
    }
  };

  // Trigger live attack helper
  const triggerLiveAttack = async (attackType: string) => {
    if (!targetDeviceId) {
      toast.error('No target device available. Connect ASTRA Windows Agent.');
      return;
    }
    if (!isTargetOnline) {
      toast.error(`TARGET OFFLINE — Device "${targetDevice?.name}" is offline.`);
      return;
    }

    try {
      const targetParam = `?target=${encodeURIComponent(targetDeviceId)}`;
      const res = await api.post(`/live-attacks/${attackType}${targetParam}`);
      toast.success(`Dispatched ${attackType} on ${targetDevice?.name}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'TARGET OFFLINE — ACTION NOT EXECUTED');
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Threat Vectors & Endpoint Defense"
        description="Classified dossier database of known attack vectors, safe endpoint simulations, and verified remediation execution."
      />

      {/* Target Device Selector Banner */}
      <div className="mb-6 p-4 border border-border-color/60 bg-surface/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Target Endpoint:</span>
          <select
            value={selectedDevice || (targetDevice?.id || '')}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-surface border border-primary/40 px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-primary"
          >
            {devices.length === 0 ? (
              <option value="">No Devices Enrolled</option>
            ) : (
              [...devices].sort((a: any, b: any) => (b.status === 'ONLINE' ? 1 : 0) - (a.status === 'ONLINE' ? 1 : 0)).map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.status === 'ONLINE' ? '🟢' : '🔴'} {d.name} ({d.ipAddress || d.ip || '127.0.0.1'}) — [{d.status || 'OFFLINE'}]
                </option>
              ))
            )}
          </select>
          {targetDevice && (
            <span className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded ${
              isTargetOnline ? 'bg-success/20 text-success border border-success/40 animate-pulse' : 'bg-danger/20 text-danger border border-danger/40'
            }`}>
              ● {targetDevice.status || 'OFFLINE'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMobileModalOpen(true)} 
            className="text-xs font-mono border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <Smartphone size={14} className="text-cyan-400 animate-pulse" /> Mobile C2 Remote
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchDevices()} 
            className="text-xs font-mono border-white/20 text-white/70 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Refresh Endpoints
          </Button>
        </div>
      </div>

      <MobileRemoteModal 
        isOpen={isMobileModalOpen} 
        onClose={() => setIsMobileModalOpen(false)} 
      />

      {!targetDevice ? (
        <div className="mb-6 p-3 border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>
            NO TARGET SELECTED — Please select an active online endpoint from the dropdown above to dispatch commands.
          </span>
        </div>
      ) : !isTargetOnline ? (
        <div className="mb-6 p-3 border border-danger/40 bg-danger/10 text-danger text-xs font-mono flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0" />
          <span>
            TARGET OFFLINE — Device "{targetDevice.name}" is currently offline. Ensure ASTRA Agent is running on that machine.
          </span>
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-border-color/50 pb-2">
        <button
          onClick={() => setActiveTab('LIVE')}
          className={`font-mono text-sm px-4 py-2 ${activeTab === 'LIVE' ? 'text-danger border-b-2 border-danger font-bold' : 'text-white/60 hover:text-white'}`}
        >
          [SAFE ATTACK SIMULATION]
        </button>
        <button
          onClick={() => setActiveTab('REMEDIATION')}
          className={`font-mono text-sm px-4 py-2 ${activeTab === 'REMEDIATION' ? 'text-primary border-b-2 border-primary font-bold' : 'text-white/60 hover:text-white'}`}
        >
          [VERIFIED DEFENSIVE ACTIONS]
        </button>
        <button
          onClick={() => setActiveTab('SCRIPTED')}
          className={`font-mono text-sm px-4 py-2 ${activeTab === 'SCRIPTED' ? 'text-accent border-b-2 border-accent font-bold' : 'text-white/60 hover:text-white'}`}
        >
          [SYNTHETIC SCENARIOS]
        </button>
      </div>

      {/* ── Main Operations Section ── */}
      <PageSection className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Action Buttons */}
        <div className="space-y-6">

          {activeTab === 'LIVE' && (
            <div className="space-y-6">
              {/* Category 1: High Impact Threats with Multi-Step Recovery */}
              <Card className="border-red-500/30 bg-red-500/5">
                <h3 className="mb-2 text-base font-bold text-red-400 border-b border-red-500/20 pb-2 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    💀 Category 1: High-Impact Vectors (Step-by-Step Recovery)
                  </span>
                  <Badge variant="danger">Interactive</Badge>
                </h3>
                <p className="text-xs text-white/60 mb-3 font-mono">
                  Triggers active sandbox payloads on target laptop. Remediate step-by-step from the Recovery page.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('DARKSIDE_PAYLOAD')}
                    className="p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 rounded-lg text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-red-300 text-xs flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-red-400 group-hover:animate-bounce" />
                        DarkSide Rogue Window
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-black border border-red-500/30">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 font-mono line-clamp-2">
                      Spawns persistent malicious cmd window & injects background process on target laptop.
                    </p>
                  </button>

                  <button
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('STEALTH_RAT_BACKDOOR')}
                    className="p-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 rounded-lg text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-400 group-hover:animate-pulse" />
                        Stealth RAT & Lock
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-black border border-amber-500/30">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 font-mono line-clamp-2">
                      Opens TCP backdoor on target laptop and locks the workstation screen.
                    </p>
                  </button>

                  <button
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('SIMULATED_RANSOMWARE')}
                    className="p-3 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 rounded-lg text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-red-200 text-xs flex items-center gap-1.5">
                        🔒 Ransomware Encryption
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 font-mono line-clamp-1">
                      Simulates canary file encryption in C:\Astra\Demo.
                    </p>
                  </button>

                  <button
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('REGISTRY_HIJACK')}
                    className="p-3 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 rounded-lg text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-purple-200 text-xs flex items-center gap-1.5">
                        ⚙️ Registry Hijack
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold">
                        HIGH
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 font-mono line-clamp-1">
                      Simulates Task Manager policy tamper & registry hooks.
                    </p>
                  </button>
                </div>
              </Card>

              {/* Category 2: Visual Threat Demonstrations & Overlays */}
              <Card className="border-cyan-500/30 bg-cyan-500/5">
                <h3 className="mb-2 text-base font-bold text-cyan-400 border-b border-cyan-500/20 pb-2 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" />
                    ⚡ Category 2: Visual Overlays & WOW Demonstrations
                  </span>
                  <Badge variant="default">Visual HUD</Badge>
                </h3>
                <p className="text-xs text-white/60 mb-3 font-mono">
                  Renders full-screen high-tech HUD overlays directly on the target laptop screen.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('HACKER_WALLPAPER')}
                  >
                    💀 Skull Wallpaper
                  </Button>

                  <Button
                    variant="outline"
                    className="border-green-500/40 text-green-400 hover:bg-green-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('MATRIX_RAIN')}
                  >
                    🌧️ Matrix Rain HUD
                  </Button>

                  <Button
                    variant="outline"
                    className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('GHOST_TYPER')}
                  >
                    ⌨️ Ghost Typer
                  </Button>

                  <Button
                    variant="outline"
                    className="border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('CYBER_GLITCH')}
                  >
                    ⚡ Memory Glitch
                  </Button>

                  <Button
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('RADAR_BEACON')}
                  >
                    📡 Radar Beacon
                  </Button>

                  <Button
                    variant="outline"
                    className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 flex items-center justify-center gap-1.5 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => triggerLiveAttack('HEX_SHIELD')}
                  >
                    🛡️ Hex Shield HUD
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'REMEDIATION' && (
            <Card className="border-primary/30 bg-primary/5">
              <h3 className="mb-3 text-lg font-medium text-white border-b border-border-color pb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                Real-Time Physical Endpoint Control & Remediation
              </h3>
              <p className="text-xs text-white/70 mb-4 font-mono">
                Dispatches real physical control actions directly to the target Windows laptop. The agent modifies live Windows state and returns verified outcomes.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-red-500/60 text-red-400 hover:bg-red-500/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('SNIPE_ROGUE_WINDOW')}
                  >
                    <Trash2 size={15} />
                    🪟 Snipe & Force-Close Rogue Window
                  </Button>

                  <Button
                    variant="outline"
                    className="border-amber-500/60 text-amber-400 hover:bg-amber-500/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('LOCK_WORKSTATION')}
                  >
                    <ShieldAlert size={15} />
                    🔒 Remotely Lock Laptop Screen
                  </Button>

                  <Button
                    variant="outline"
                    className="border-primary/60 text-primary hover:bg-primary/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('DISABLE_RDP')}
                  >
                    <ShieldCheck size={15} />
                    Disable Remote Desktop (RDP)
                  </Button>

                  <Button
                    variant="outline"
                    className="border-primary/60 text-primary hover:bg-primary/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('RESTORE_FIREWALL')}
                  >
                    <ShieldCheck size={15} />
                    Enable Windows Firewall
                  </Button>

                  <Button
                    variant="outline"
                    className="border-primary/60 text-primary hover:bg-primary/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('ENABLE_REALTIME')}
                  >
                    <ShieldCheck size={15} />
                    Enable Defender Real-Time
                  </Button>

                  <Button
                    variant="outline"
                    className="border-success/60 text-success hover:bg-success/15 flex items-center justify-center gap-2 text-xs font-mono py-2.5"
                    disabled={!isTargetOnline}
                    onClick={() => sendDirectCommand('FINAL_VERIFICATION')}
                  >
                    <CheckCircle size={15} />
                    Audit Endpoint Baseline
                  </Button>
                </div>

                <div className="pt-4 border-t border-border-color/30">
                  <h4 className="text-xs font-bold text-white/70 mb-3 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Zap size={13} className="text-primary" /> Visual HUD & Screen Controls
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('SHOW_MATRIX_OVERLAY')}
                    >Matrix HUD</Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('CLEAR_MATRIX')}
                    >Clear Matrix</Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('SHOW_HACKER_SKULL')}
                    >Skull Wallpaper</Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('SHOW_GLITCH_BREACH')}
                    >Glitch HUD</Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('SHOW_RADAR_BEACON')}
                    >Radar HUD</Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white/80 hover:text-white font-mono text-xs"
                      disabled={!isTargetOnline}
                      onClick={() => sendDirectCommand('SHOW_HEX_SHIELD')}
                    >Hex Shield</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'SCRIPTED' && (
            <Card className="border-accent/30 bg-accent/5">
              <h3 className="mb-3 text-lg font-medium text-white border-b border-border-color pb-2 flex items-center gap-2">
                <Zap size={16} className="text-accent" />
                Synthetic Threat Generator
              </h3>
              <p className="text-xs text-white/70 mb-4 font-mono">
                Generate random synthetic security telemetry across the ASTRA threat library.
              </p>
              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 flex items-center gap-2 font-mono text-xs"
                onClick={async () => {
                  try {
                    const targetParam = targetDeviceId ? `?target=${encodeURIComponent(targetDeviceId)}` : '';
                    await api.post(`/simulation/trigger/random${targetParam}`);
                    toast.success(`Triggered synthetic threat scenario on ${targetDevice?.name || 'endpoint'}`);
                  } catch (err: any) {
                    toast.error(err.response?.data?.error || 'Failed to trigger scenario');
                  }
                }}
              >
                <Zap size={15} />
                Trigger Random Synthetic Threat
              </Button>
            </Card>
          )}

          {/* Real-time Command Pipeline Execution Status Panel */}
          <Card className="border-border-color/80">
            <h3 className="mb-3 text-sm font-bold text-white border-b border-border-color pb-2 flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <Terminal size={15} className="text-primary" />
                Command Execution & Verification Pipeline
              </span>
              {commandQueue.length > 0 && (
                <button
                  onClick={() => setCommandQueue([])}
                  className="text-xs text-white/40 hover:text-white/80 flex items-center gap-1 font-mono"
                >
                  <Trash2 size={11} /> Clear
                </button>
              )}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {commandQueue.length === 0 ? (
                <p className="text-xs text-white/30 font-mono py-4 text-center">
                  No commands dispatched in current session.
                </p>
              ) : (
                commandQueue.map((cmd) => (
                  <div key={cmd.commandId} className="p-2.5 bg-surface/80 border border-border-color text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 font-bold">{cmd.commandType}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-none ${
                        cmd.status === 'COMPLETED' || cmd.status === 'VERIFIED'
                          ? 'bg-success/20 text-success border border-success/40'
                          : cmd.status === 'FAILED' || cmd.status === 'REJECTED'
                          ? 'bg-danger/20 text-danger border border-danger/40'
                          : cmd.status === 'DELIVERED' || cmd.status === 'EXECUTING'
                          ? 'bg-primary/20 text-primary border border-primary/40 animate-pulse'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      }`}>
                        {cmd.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span>ID: {cmd.commandId.substring(0, 16)}</span>
                      <span>{cmd.timestamp}</span>
                    </div>

                    {cmd.result && (
                      <div className="mt-1 p-1.5 bg-black/40 text-[11px] text-white/70 border-l-2 border-primary/50 overflow-x-auto whitespace-pre-wrap font-mono">
                        {cmd.result}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* Right: Response Timeline */}
        <Card className="flex flex-col border-primary/20" style={{ minHeight: 450 }}>
          <div className="flex items-center justify-between mb-4 border-b border-border-color pb-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              Response Timeline
              {actionLog.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
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
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
                <Play size={32} className="opacity-20" />
                <p className="text-sm font-mono">No threat events yet.</p>
                <p className="text-xs">Trigger a live attack or simulation to see real-time response data</p>
              </div>
            ) : (
              actionLog.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 font-mono text-xs border-l-2 border-primary/40 bg-surface/40"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-primary/50">[{entry.time}]</span>
                    <span className={`px-1.5 py-0 text-[9px] font-black tracking-widest border rounded-none ${severityClass(entry.severity)}`}>
                      {entry.severity}
                    </span>
                    <span className="text-white/80 font-semibold truncate">{entry.threatName}</span>
                  </div>
                  <div className="h-0.5 bg-white/5 mb-1.5">
                    <div
                      className={`h-0.5 transition-all duration-500 ${
                        entry.severity === 'CRITICAL' ? 'bg-danger' :
                        entry.severity === 'HIGH' ? 'bg-orange-400' :
                        entry.severity === 'MEDIUM' ? 'bg-yellow-400' : 'bg-success'
                      }`}
                      style={{ width: entry.severity === 'CRITICAL' ? '100%' : entry.severity === 'HIGH' ? '75%' : entry.severity === 'MEDIUM' ? '50%' : '25%' }}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={11} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white/60 leading-relaxed">{entry.action}</span>
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
            Threat Catalog & MITRE Library ({scenarios?.length || 0})
          </h3>
          <p className="text-sm text-white/70 mb-4 font-mono">
            Trigger individual catalog threat scenarios for evaluation and demonstration.
          </p>

          {isLoading ? (
            <div className="flex justify-center p-8 text-primary">
              <span className="animate-pulse font-mono">Loading catalog scenarios...</span>
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
                    <p className="text-white/60 text-xs mb-2 font-mono">{scenario.category}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-colors font-mono text-xs"
                    onClick={async () => {
                      try {
                        const targetParam = targetDeviceId ? `?target=${encodeURIComponent(targetDeviceId)}` : '';
                        await api.post(`/simulation/trigger/${scenario.threatId}${targetParam}`);
                        toast.success(`Triggered: ${scenario.threatName} on ${targetDevice?.name || 'endpoint'}`);
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || 'Failed to trigger scenario');
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
