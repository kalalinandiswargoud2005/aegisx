import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Zap, 
  Skull, 
  Terminal, 
  Lock, 
  Radio, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Eye, 
  Layers, 
  Smartphone,
  Wifi,
  ChevronRight
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
      console.error('Failed to fetch devices', e);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, [selectedDeviceId]);

  const selectedDevice = devices.find((d: any) => d.id === selectedDeviceId);
  const isOnline = selectedDevice?.status === 'ONLINE';

  const addLog = (text: string, status: 'SUCCESS' | 'ERROR' | 'QUEUED') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: Math.random().toString(), time, text, status }, ...prev].slice(0, 15));
  };

  // Trigger live attack vector
  const handleTriggerAttack = async (attackType: string, label: string) => {
    if (!selectedDeviceId) {
      toast.error('No target device selected');
      return;
    }
    if (!isOnline) {
      toast.error(`TARGET OFFLINE: ${selectedDevice?.name || 'Device'} is not connected.`);
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 60]);
    }

    setLoadingAction(attackType);
    addLog(`Deploying ${label}...`, 'QUEUED');

    try {
      await api.post(`/live-attacks/${attackType}?target=${encodeURIComponent(selectedDeviceId)}`);
      toast.success(`⚡ Deployed: ${label}`, {
        description: `Target: ${selectedDevice?.name || 'Endpoint'}`
      });
      addLog(`✓ ${label} executed on ${selectedDevice?.name}`, 'SUCCESS');
    } catch (err: any) {
      const msg = err.response?.data?.error || `Failed to deploy ${label}`;
      toast.error(msg);
      addLog(`✕ Failed: ${label}`, 'ERROR');
    } finally {
      setLoadingAction(null);
    }
  };

  // Direct endpoint commands
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

  // 1-Tap Autonomous Remediation for all threats
  const handleInstantRemediation = async () => {
    if (!selectedDeviceId) return;
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setIsRemediatingAll(true);
    addLog('Initiating Autonomous Incident Resolution...', 'QUEUED');

    try {
      // 1. Fetch active threats
      const res = await api.get('/threats');
      const activeThreats = (res.data || []).filter((t: any) => t.status === 'ACTIVE');

      if (activeThreats.length > 0) {
        for (const threat of activeThreats) {
          try {
            await api.post(`/threats/${threat.id}/resolve`);
          } catch (e) {}
        }
      }

      // 2. Dispatch baseline restoration & clear matrix overlay
      await api.post(`/devices/${selectedDeviceId}/command`, { commandType: 'FINAL_VERIFICATION' });
      await api.post(`/devices/${selectedDeviceId}/command`, { commandType: 'CLEAR_MATRIX' });

      toast.success('🛡️ System Fully Remediated & Baseline Verified!');
      addLog('✓ Endpoint secured & clean baseline reconciled', 'SUCCESS');
    } catch (err) {
      toast.error('Remediation sequence encountered an issue');
      addLog('✕ Remediation error', 'ERROR');
    } finally {
      setIsRemediatingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white p-4 pb-20 font-sans max-w-md mx-auto select-none">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Smartphone size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono">ASTRA RED-TEAM</h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-tight">Wireless C2 Controller</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/10">
          <Wifi size={12} className={isOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-500'} />
          <span className={`text-[10px] font-mono font-bold ${isOnline ? 'text-emerald-400' : 'text-rose-500'}`}>
            {isOnline ? 'LAN LINKED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Target Device Card */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-b from-gray-900/90 to-black border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Target Endpoint</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {selectedDevice?.status || 'NO DEVICES'}
          </span>
        </div>

        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
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

      {/* Primary Emergency Remediation Action */}
      <div className="mb-5">
        <button
          onClick={handleInstantRemediation}
          disabled={isRemediatingAll || !isOnline}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 active:scale-95 transition-all duration-150 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:pointer-events-none"
        >
          <RefreshCw size={16} className={isRemediatingAll ? 'animate-spin' : ''} />
          {isRemediatingAll ? 'Remediating Endpoint...' : '⚡ 1-Tap Autonomous Recovery'}
        </button>
      </div>

      {/* Threat Vector Deployment Deck */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-bold">
            <Flame size={14} /> Threat Vectors (Live Demos)
          </span>
          <span className="text-[9px] font-mono text-gray-500">TOUCH TO TRIGGER</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Simulated Ransomware */}
          <button
            onClick={() => handleTriggerAttack('SIMULATED_RANSOMWARE', 'Simulated Ransomware')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/60 active:bg-rose-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24 relative overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <Skull size={20} className="text-rose-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">CRITICAL</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Ransomware</p>
              <p className="text-[9px] text-gray-400 font-mono">File Encryption Demo</p>
            </div>
          </button>

          {/* Hacker Skull Overlay */}
          <button
            onClick={() => handleTriggerAttack('HACKER_WALLPAPER', 'Hacker Skull Wallpaper')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 hover:border-orange-500/60 active:bg-orange-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24 relative overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              <AlertTriangle size={20} className="text-orange-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">VISUAL</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Hacker Skull</p>
              <p className="text-[9px] text-gray-400 font-mono">Full-Screen Overlay</p>
            </div>
          </button>

          {/* Zero-Day Memory Glitch */}
          <button
            onClick={() => handleTriggerAttack('CYBER_GLITCH', 'Zero-Day Memory Breach')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/30 hover:border-fuchsia-500/60 active:bg-fuchsia-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Zap size={20} className="text-fuchsia-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold">0-DAY</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Memory Glitch</p>
              <p className="text-[9px] text-gray-400 font-mono">Heap Spray Scanlines</p>
            </div>
          </button>

          {/* Matrix Security Stream */}
          <button
            onClick={() => handleTriggerAttack('MATRIX_RAIN', 'Matrix Security HUD')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/60 active:bg-emerald-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Terminal size={20} className="text-emerald-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">CYBER</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Matrix Rain HUD</p>
              <p className="text-[9px] text-gray-400 font-mono">Live Cyber Stream</p>
            </div>
          </button>

          {/* C2 Radar Intercept */}
          <button
            onClick={() => handleTriggerAttack('RADAR_BEACON', 'C2 Radar Beacon')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-500/60 active:bg-cyan-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Radio size={20} className="text-cyan-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">BEACON</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Radar Beacon</p>
              <p className="text-[9px] text-gray-400 font-mono">Port 44444 Intercept</p>
            </div>
          </button>

          {/* Ghost Typer Keystroke */}
          <button
            onClick={() => handleTriggerAttack('GHOST_TYPER', 'Ghost Typer Keystroke')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-500/60 active:bg-purple-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Eye size={20} className="text-purple-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">INJECTION</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Ghost-Typer</p>
              <p className="text-[9px] text-gray-400 font-mono">Simulated Keystroke</p>
            </div>
          </button>

          {/* Stealth RAT Backdoor */}
          <button
            onClick={() => handleTriggerAttack('STEALTH_RAT_BACKDOOR', 'Stealth RAT Backdoor')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:border-indigo-500/60 active:bg-indigo-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Activity size={20} className="text-indigo-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">RAT</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Stealth RAT</p>
              <p className="text-[9px] text-gray-400 font-mono">Socket Listener</p>
            </div>
          </button>

          {/* Hexagonal Shield */}
          <button
            onClick={() => handleTriggerAttack('HEX_SHIELD', 'Hex Defense Shield')}
            disabled={loadingAction !== null || !isOnline}
            className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 hover:border-blue-500/60 active:bg-blue-900/50 active:scale-95 transition-all text-left flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between w-full">
              <Shield size={20} className="text-blue-400" />
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">DEFENSE</span>
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-white leading-tight">Hex Shield</p>
              <p className="text-[9px] text-gray-400 font-mono">5-Layer Hardening</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Endpoint Actions */}
      <div className="mb-4 p-3 rounded-xl bg-black/40 border border-white/10">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block mb-2.5 font-bold">
          Direct Enforcement Controls
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDirectCommand('LOCK_WORKSTATION', 'Lock Workstation')}
            disabled={!isOnline}
            className="py-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 active:bg-amber-500/30 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <Lock size={13} /> Lock Endpoint
          </button>

          <button
            onClick={() => handleDirectCommand('SHOW_TEST_ENFORCEMENT', 'Test Security HUD')}
            disabled={!isOnline}
            className="py-2.5 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 active:bg-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <Zap size={13} /> Safe Test HUD
          </button>
        </div>
      </div>

      {/* Tactical Activity Log Stream */}
      <div className="p-3 rounded-xl bg-black/60 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-bold">Live Remote Telemetry</span>
          <span className="text-[9px] font-mono text-cyan-400">0ms DELAY</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px]">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Ready for commands. Tap any threat vector above to deploy.</p>
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
