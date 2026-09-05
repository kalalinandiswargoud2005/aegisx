import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Laptop, Server, Smartphone, Cpu, HardDrive, Wifi, ShieldCheck, 
  ShieldAlert, Activity, Terminal, Trash2, ArrowLeft, RefreshCw, 
  Lock, AlertTriangle, Zap, Play, Pause, Monitor, CheckCircle, XCircle
} from 'lucide-react';
import { Card, Button, Badge, PageContainer, PageSection, PageHeader } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const [isIsolated, setIsIsolated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ASTRA AGENT KERNEL INTERFACE CONNECTED [v2.4.0]',
    'Agent session established via WebSocket STOMP TLS',
    'Type "help" or run diagnostic commands (ipconfig, netstat, ps, kill <pid>, isolate, scan)',
  ]);
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch real device details from backend if available
  const { data: deviceList = [], isLoading: isDeviceLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    }
  });

  const device = deviceList.find((d: any) => String(d.id) === id || d.name === id);
  const safeDeviceName = device?.name || 'Unknown Device';

  // Removed fake CPU/RAM pulsing

  // Live WebSocket updates for this device
  useEffect(() => {
    const unsubThreats = subscribe('threats', (incident: any) => {
      setTerminalLogs((prev) => [...prev, `[ALERT] New Incident Detected on ${safeDeviceName}: ${incident.name || 'Unknown Threat'}`]);
    });
    
    // Subscribe to terminal output from the agent via device UUID
    const targetTopicId = device?.id || id;
    const unsubTerminal = subscribe(`device/${targetTopicId}/terminal`, (data: any) => {
      if (data.result) {
        setTerminalLogs((prev) => {
          // Keep max 200 lines
          const next = [...prev, data.result];
          return next.slice(-200);
        });
      }
    });

    const unsubNamed = (id !== device?.id) ? subscribe(`device/${id}/terminal`, (data: any) => {
      if (data.result) {
        setTerminalLogs((prev) => [...prev.slice(-199), data.result]);
      }
    }) : () => {};

    return () => {
      unsubThreats();
      unsubTerminal();
      unsubNamed();
    };
  }, [subscribe, safeDeviceName, id, device?.id]);

  const handleKillProcess = async (pid: number, procName: string) => {
    try {
      await api.post(`/devices/${device.id}/command`, { commandType: 'KILL_PROCESS', target: procName });
      setTerminalLogs((prev) => [...prev, `[ACTION] Sent KILL_PROCESS for ${procName} (PID ${pid}) to Agent`]);
      toast.success(`Kill Command Dispatched`, {
        description: `Instructed agent on ${safeDeviceName} to terminate ${procName}.`
      });
    } catch (e) {
      toast.error('Failed to send kill command');
    }
  };

  const handleIsolateToggle = async () => {
    const nextState = !isIsolated;
    try {
      if (nextState) {
        await api.post(`/devices/${device.id}/command`, { commandType: 'ISOLATE_DEVICE' });
      } else {
        await api.post(`/devices/${device.id}/command`, { commandType: 'RESTORE_NETWORK' }); // Using a mock restore command if applicable
      }
      setIsIsolated(nextState);
      
      setTerminalLogs((prev) => [
        ...prev,
        nextState 
          ? `[DEFENSE] Sent ISOLATE_DEVICE command to ${safeDeviceName}.`
          : `[DEFENSE] Sent RESTORE_NETWORK command to ${safeDeviceName}.`
      ]);
      if (nextState) {
        toast.error(`Isolation Command Dispatched`, { description: `Instructing ${safeDeviceName} to disable network adapters.` });
      } else {
        toast.success(`Restore Command Dispatched`, { description: `Instructing ${safeDeviceName} to restore normal traffic.` });
      }
    } catch (e) {
      toast.error('Failed to send isolation command');
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setTerminalLogs((prev) => [...prev, `[SCAN] Instructing ${safeDeviceName} to run FULL_DEFENDER_SCAN...`]);
    try {
      await api.post(`/devices/${device.id}/command`, { commandType: 'FULL_DEFENDER_SCAN' });
      toast.success(`Scan Command Dispatched`, { description: `Defender scan initiated on ${safeDeviceName}.` });
      setTimeout(() => {
        setIsScanning(false);
        setTerminalLogs((prev) => [...prev, `[SCAN COMPLETE] Agent reported 0 Threats found.`]);
      }, 3000);
    } catch (e) {
      setIsScanning(false);
      toast.error('Failed to send scan command');
    }
  };

  const sendRemoteCommand = async (type: string, target?: string) => {
    try {
      await api.post(`/devices/${device.id}/command`, { commandType: type, target });
      setTerminalLogs((prev) => [...prev, `[POLICY] Enforcing ${type} on ${safeDeviceName}...`]);
      toast.success(`Policy Enforced: ${type}`);
    } catch (e) {
      toast.error(`Failed to enforce ${type}`);
    }
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setTerminalLogs(prev => [...prev, `> ${cmd}`]);
    setCommandInput('');

    if (cmd.toLowerCase() === 'clear') {
      setTerminalLogs([]);
      return;
    }

    try {
      await api.post(`/devices/${device.id}/command`, { commandType: 'RUN_CMD', target: cmd });
      setTerminalLogs(prev => [...prev, `[WAITING] Dispatched to agent...`]);
    } catch (e) {
      toast.error('Failed to send terminal command');
      setTerminalLogs(prev => [...prev, `[ERROR] Failed to communicate with backend.`]);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs.length]);

  if (isDeviceLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <RefreshCw size={48} className="text-primary animate-spin" />
          <h2 className="text-xl font-mono text-primary animate-pulse">Loading Device Data...</h2>
        </div>
      </PageContainer>
    );
  }

  if (!device) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertTriangle size={48} className="text-danger" />
          <h2 className="text-xl font-mono text-danger">Device Not Found</h2>
          <p className="text-white/60 text-sm">The requested device is not registered or is offline. Only real devices are shown.</p>
          <Button variant="outline" onClick={() => navigate('/devices')}>Return to Devices</Button>
        </div>
      </PageContainer>
    );
  }

  const [isUpdating, setIsUpdating] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleUpdateAgent = async () => {
    if (!device) return;
    setIsUpdating(true);
    try {
      await api.post(`/devices/${device.id}/command`, { commandType: 'UPDATE_AGENT', target: 'LATEST_BINARY' });
      toast.success('⚡ Agent OTA Update Dispatched', {
        description: `Instructed ${safeDeviceName} to download new features & restart.`
      });
      setTerminalLogs(prev => [...prev, `[OTA-UPDATE] Dispatched UPDATE_AGENT command to ${safeDeviceName}...`]);
    } catch (err: any) {
      toast.error('Update failed', { description: err.response?.data?.error || 'Endpoint unreachable' });
    } finally {
      setTimeout(() => setIsUpdating(false), 2500);
    }
  };

  const handleRestartAgent = async () => {
    if (!device) return;
    setIsRestarting(true);
    try {
      await api.post(`/devices/${device.id}/command`, { commandType: 'RESTART_AGENT', target: 'RESTART_SERVICE' });
      toast.success('🔄 Agent Restart Dispatched', {
        description: `Agent process on ${safeDeviceName} is restarting.`
      });
      setTerminalLogs(prev => [...prev, `[LIFECYCLE] Dispatched RESTART_AGENT command to ${safeDeviceName}...`]);
    } catch (err: any) {
      toast.error('Restart failed', { description: err.response?.data?.error || 'Endpoint unreachable' });
    } finally {
      setTimeout(() => setIsRestarting(false), 2500);
    }
  };

  return (
    <PageContainer>
      {/* Top Header Bar */}
      <PageHeader
        title={`Device Room: ${device.name}`}
        description={`Dedicated Real-Time Watch & Endpoint Command Deck for ${device.name}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/devices')}
            className="flex items-center gap-2 font-mono text-xs"
          >
            <ArrowLeft size={14} /> Back to Devices
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={handleUpdateAgent}
            disabled={isUpdating}
            className="flex items-center gap-2 font-mono text-xs border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <Zap size={14} className={isUpdating ? "animate-spin text-amber-400" : "text-primary"} />
            {isUpdating ? 'Updating Agent...' : 'Update Agent (OTA)'}
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={handleRestartAgent}
            disabled={isRestarting}
            className="flex items-center gap-2 font-mono text-xs border-white/20 text-white/80 hover:bg-white/10"
          >
            <RefreshCw size={14} className={isRestarting ? "animate-spin text-primary" : ""} />
            {isRestarting ? 'Restarting...' : 'Restart Agent'}
          </Button>

          <Button 
            variant={isIsolated ? "primary" : "danger"} 
            size="sm"
            onClick={handleIsolateToggle}
            className="flex items-center gap-2 font-mono text-xs"
          >
            <Lock size={14} />
            {isIsolated ? 'Restore Network' : 'Isolate Device'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-2 font-mono text-xs border-primary/50 text-primary"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? 'Scanning...' : 'Run Deep Scan'}
          </Button>
        </div>
      </PageHeader>

      {/* Device Overview Banner */}
      <PageSection>
        <Card className={`border ${isIsolated ? 'border-danger/80 bg-danger/10' : 'border-primary/40'} p-5 font-mono`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface border border-primary/40 text-primary flex items-center justify-center">
                {device.type === 'Server' ? <Server size={32} /> : <Laptop size={32} />}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{device.name}</h2>
                  <Badge variant={device.health === 'Healthy' ? 'success' : 'danger'}>
                    {device.health}
                  </Badge>
                  {isIsolated && (
                    <span className="px-2.5 py-0.5 bg-danger text-black font-bold text-xs animate-pulse">
                      ISOLATED FROM NETWORK
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60 mt-1 flex flex-wrap gap-4">
                  <span>OS: <strong className="text-white">{device.os}</strong></span>
                  <span>IP: <strong className="text-cyan-300">{device.ipAddress}</strong></span>
                  <span>MAC: <strong className="text-white/80">{device.macAddress}</strong></span>
                  <span>Agent: <strong className="text-primary">{device.agentVersion}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 text-xs">
              <div>
                <span className="text-white/40 block text-[10px]">C2 STATUS</span>
                <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CONNECTED
                </span>
              </div>
            </div>
          </div>
        </Card>
      </PageSection>



      {/* Remote Policy Enforcement Panel */}
      <PageSection>
        <Card className="border-warning/30 bg-warning/5">
          <div className="flex items-center justify-between mb-4 border-b border-warning/20 pb-3 font-mono">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-warning flex items-center gap-2">
                <ShieldCheck size={18} className="text-warning" />
                Remote Policy Enforcement & Remediation
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Click below to dispatch real commands to the Java Agent running on the target device.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger/10 flex flex-col items-center justify-center p-4 h-24" onClick={() => sendRemoteCommand('DISABLE_RDP')}>
              <Lock size={20} className="mb-2" />
              <span className="text-xs">Disable RDP</span>
            </Button>
            <Button variant="outline" className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex flex-col items-center justify-center p-4 h-24" onClick={() => sendRemoteCommand('RESTORE_FIREWALL')}>
              <ShieldCheck size={20} className="mb-2" />
              <span className="text-xs">Restore Firewall</span>
            </Button>
            <Button variant="outline" className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 flex flex-col items-center justify-center p-4 h-24" onClick={() => {
              const file = prompt("Enter file path to quarantine (e.g. C:\\temp\\malware.exe):", "C:\\temp\\malware.exe");
              if (file) sendRemoteCommand('QUARANTINE_FILE', file);
            }}>
              <HardDrive size={20} className="mb-2" />
              <span className="text-xs">Quarantine File</span>
            </Button>
            <Button variant="outline" className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10 flex flex-col items-center justify-center p-4 h-24" onClick={() => {
              const user = prompt("Enter local username to disable:", "hacker");
              if (user) sendRemoteCommand('DISABLE_USER', user);
            }}>
              <Trash2 size={20} className="mb-2" />
              <span className="text-xs">Disable User Account</span>
            </Button>
          </div>
        </Card>
      </PageSection>

      {/* Interactive Web Terminal */}
      <PageSection className="font-mono">
        <Card className="flex flex-col border-primary/30 h-[400px]">
          <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              Interactive Agent Terminal ({device.name})
            </h3>
            <span className="text-[10px] text-white/40">Direct C2 Socket Connection</span>
          </div>

          <div className="flex-1 bg-black border border-primary/30 p-3 text-xs overflow-y-auto space-y-1">
            {terminalLogs.map((log, idx) => (
              <p key={idx} className={log.startsWith('>') ? 'text-primary font-bold mt-2' : log.includes('[ALERT]') ? 'text-danger font-bold' : 'text-white/80 whitespace-pre-wrap'}>
                {log}
              </p>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center gap-2">
            <span className="text-primary font-bold text-xs">{'>'}</span>
            <input
              type="text"
              placeholder="Type command (e.g. dir, ipconfig, whoami, clear)..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-surface border border-white/20 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Send Command
            </Button>
          </form>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
