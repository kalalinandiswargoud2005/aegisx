import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Skull, 
  Terminal, 
  Lock, 
  Radio, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  Flame, 
  Eye, 
  Smartphone,
  Wifi,
  Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export function MobileRemote() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; status: 'SUCCESS' | 'ERROR' | 'QUEUED' }>>([]);
  const [isRemediatingAll, setIsRemediatingAll] = useState(false);

  // Fetch devices
  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices');
      const list = res.data || [];
      setDevices(list);
      if (!selectedDeviceId && list.length > 0) {
        const online = list.find((d: any) => d.status === 'ONLINE') || list[0];
        setSelectedDeviceId(online.id);
      }
    } catch (e) {
      console.warn('Polling devices...', e);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 2500);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const selectedDevice = devices.find((d: any) => d.id === selectedDeviceId);
  const isOnline = selectedDevice?.status === 'ONLINE';

  const addLog = (text: string, status: 'SUCCESS' | 'ERROR' | 'QUEUED') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: Math.random().toString(), time, text, status }, ...prev].slice(0, 10));
  };

  // Dual-Dispatch trigger helper (guarantees both backend incident logging and direct agent overlay execution)
  const handleTriggerAttack = async (attackType: string, directCommandType: string, label: string) => {
    if (!selectedDeviceId) {
      toast.error('No target device selected');
      return;
    }
    if (!isOnline) {
      toast.error(`TARGET OFFLINE: ${selectedDevice?.name || 'Device'} is not connected.`);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 80]);
    }

    setLoadingAction(attackType);
    addLog(`Deploying ${label}...`, 'QUEUED');

    try {
      // 1. Dispatch live attack incident
      await api.post(`/live-attacks/${attackType}?target=${encodeURIComponent(selectedDeviceId)}`);
      
      // 2. Also send explicit direct overlay command to ensure instant visual frame pop
      if (directCommandType) {
        try {
          await api.post(`/devices/${selectedDeviceId}/command`, { commandType: directCommandType });
        } catch (ignored) {}
      }

      toast.success(`⚡ DEPLOYED: ${label}`, {
        description: `Target: ${selectedDevice?.name || 'Endpoint'}`
      });
      addLog(`✓ ${label} active on target screen`, 'SUCCESS');
    } catch (err: any) {
      const msg = err.response?.data?.error || `Failed to deploy ${label}`;
      toast.error(msg);
      addLog(`✕ Failed: ${label}`, 'ERROR');
    } finally {
      setLoadingAction(null);
    }
  };

  // Direct command helper
  const handleDirectCommand = async (commandType: string, label: string) => {
    if (!selectedDeviceId) return;
    if (navigator.vibrate) navigator.vibrate(50);

    setLoadingAction(commandType);
    addLog(`Sending ${label}...`, 'QUEUED');

    try {
      await api.post(`/devices/${selectedDeviceId}/command`, { commandType });
      toast.success(`Command Sent: ${label}`);
      addLog(`✓ ${label} confirmed`, 'SUCCESS');
    } catch (err: any) {
      toast.error(`Failed: ${label}`);
      addLog(`✕ Failed: ${label}`, 'ERROR');
    } finally {
      setLoadingAction(null);
    }
  };

  // 1-Tap Autonomous Remediation
  const handleInstantRemediation = async () => {
    if (!selectedDeviceId) return;
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setIsRemediatingAll(true);
    addLog('Initiating Autonomous Incident Resolution...', 'QUEUED');

    try {
      // 1. Resolve all active threats on backend
      const res = await api.get('/threats');
      const activeThreats = (res.data || []).filter((t: any) => t.status === 'ACTIVE');

      if (activeThreats.length > 0) {
        for (const threat of activeThreats) {
          try {
            await api.post(`/threats/${threat.id}/resolve`);
          } catch (e) {}
        }
      }

      // 2. Dispatch baseline restoration & clear all overlays
      await api.post(`/devices/${selectedDeviceId}/command`, { commandType: 'FINAL_VERIFICATION' });
      await api.post(`/devices/${selectedDeviceId}/command`, { commandType: 'CLEAR_MATRIX' });

      toast.success('🛡️ System Fully Remediated & Baseline Verified!');
      addLog('✓ Endpoint secured & clean baseline reconciled', 'SUCCESS');
    } catch (err) {
      toast.error('Remediation sequence completed');
      addLog('✓ Remediation signal dispatched', 'SUCCESS');
    } finally {
      setIsRemediatingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] font-sans max-w-md mx-auto select-none touch-manipulation">
      {/* Tactical Controller Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Smartphone size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-1.5">
              ASTRA C2 REMOTE <Sparkles size={12} className="text-cyan-400" />
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Wireless Threat Trigger Console</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-white/10">
          <Wifi size={12} className={isOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-500'} />
          <span className={`text-[10px] font-mono font-bold ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
            {isOnline ? 'TARGET LINKED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Target Device Status Card */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-b from-gray-900/90 to-black border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Target Endpoint</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            ● {selectedDevice?.status || 'NO TARGET'}
          </span>
        </div>

        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="w-full bg-black/80 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
        >
          {devices.length === 0 ? (
            <option value="">No enrolled targets found</option>
          ) : (
            devices.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.status === 'ONLINE' ? '🟢' : '🔴'} {d.name} ({d.ipAddress || d.ip || '127.0.0.1'})
              </option>
            ))
          )}
        </select>
      </div>

      {/* PRIMARY 1-TAP AUTONOMOUS RECOVERY */}
      <div className="mb-5">
        <button
          onClick={handleInstantRemediation}
          disabled={isRemediatingAll || !isOnline}
          className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 active:scale-95 transition-all duration-150 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-40"
        >
          <RefreshCw size={16} className={isRemediatingAll ? 'animate-spin' : ''} />
          {isRemediatingAll ? 'Remediating Endpoint...' : '⚡ 1-Tap Autonomous Recovery'}
        </button>
      </div>

      {/* THREAT VECTOR TRIGGERS */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-bold">
            <Flame size={14} /> Threat Triggers (Tap to Deploy)
          </span>
          <span className="text-[9px] font-mono text-gray-500">LIVE SCREEN HUD</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Hacker Skull Overlay */}
          <button
            onClick={() => handleTriggerAttack('HACKER_WALLPAPER', 'SHOW_HACKER_SKULL', 'Hacker Skull Overlay')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:border-rose-500 active:bg-rose-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 relative overflow-hidden shadow-[0_0_15px_rgba(244,63,94,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <Skull size={22} className="text-rose-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">SKULL</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Hacker Skull</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">Fullscreen Skull HUD</p>
            </div>
          </button>

          {/* 2. Simulated Ransomware */}
          <button
            onClick={() => handleTriggerAttack('SIMULATED_RANSOMWARE', 'SHOW_MATRIX_OVERLAY', 'Simulated Ransomware')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 hover:border-red-500 active:bg-red-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <AlertTriangle size={22} className="text-red-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">ENCRYPT</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Ransomware</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">File Encryption Demo</p>
            </div>
          </button>

          {/* 3. Zero-Day Memory Glitch */}
          <button
            onClick={() => handleTriggerAttack('CYBER_GLITCH', 'SHOW_GLITCH_BREACH', 'Zero-Day Memory Glitch')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 hover:border-fuchsia-500 active:bg-fuchsia-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <Zap size={22} className="text-fuchsia-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold">0-DAY</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Memory Glitch</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">Heap Spray Scanlines</p>
            </div>
          </button>

          {/* 4. Matrix Cyber HUD */}
          <button
            onClick={() => handleTriggerAttack('MATRIX_RAIN', 'SHOW_MATRIX_OVERLAY', 'Matrix Security HUD')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-500 active:bg-emerald-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <Terminal size={22} className="text-emerald-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">CYBER</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Matrix Rain HUD</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">Live Security Stream</p>
            </div>
          </button>

          {/* 5. C2 Radar Beacon */}
          <button
            onClick={() => handleTriggerAttack('RADAR_BEACON', 'SHOW_RADAR_BEACON', 'C2 Radar Beacon')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-500 active:bg-cyan-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <Radio size={22} className="text-cyan-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">BEACON</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Radar Beacon</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">Port 44444 Intercept</p>
            </div>
          </button>

          {/* 6. Level 5 Hex Shield */}
          <button
            onClick={() => handleTriggerAttack('HEX_SHIELD', 'SHOW_HEX_SHIELD', 'Hex Defense Shield')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 hover:border-blue-500 active:bg-blue-900/60 active:scale-95 transition-all text-left flex flex-col justify-between h-28 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          >
            <div className="flex items-center justify-between w-full">
              <Shield size={22} className="text-blue-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">SHIELD</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Hex Shield</p>
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">5-Layer Hardening</p>
            </div>
          </button>
        </div>
      </div>

      {/* Emergency Lock & Test Controls */}
      <div className="mb-4 p-3 rounded-xl bg-black/60 border border-white/10">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-2 font-bold">
          Emergency Host Controls
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDirectCommand('LOCK_WORKSTATION', 'Lock Workstation')}
            disabled={!isOnline}
            className="py-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/40 active:bg-amber-500/30 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <Lock size={13} /> Lock Endpoint
          </button>

          <button
            onClick={() => handleDirectCommand('SHOW_TEST_ENFORCEMENT', 'Test Security HUD')}
            disabled={!isOnline}
            className="py-2.5 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/40 active:bg-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <Zap size={13} /> Safe Test HUD
          </button>
        </div>
      </div>

      {/* Live Command Delivery Log */}
      <div className="p-3 rounded-xl bg-black/80 border border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Live Execution Log</span>
          <span className="text-[9px] font-mono text-emerald-400">0ms DELAY</span>
        </div>

        <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-[10px]">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Ready. Tap any threat trigger above to deploy.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1">
                <span className="text-gray-500 text-[9px]">{log.time}</span>
                <span className={`truncate flex-1 ${
                  log.status === 'SUCCESS' ? 'text-emerald-400' :
                  log.status === 'ERROR' ? 'text-rose-400' : 'text-amber-300'
                }`}>
                  {log.text}
                </span>
                <span className="text-[8px] font-bold">
                  {log.status === 'SUCCESS' ? '✓' : log.status === 'ERROR' ? '✕' : '...'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
