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
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memoryMb: number;
  status: 'Running' | 'Suspended' | 'High Risk';
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 4812, name: 'powershell.exe', user: 'ASTRA\\Administrator', cpu: 14.2, memoryMb: 145, status: 'High Risk' },
  { pid: 648, name: 'lsass.exe', user: 'NT AUTHORITY\\SYSTEM', cpu: 2.1, memoryMb: 88, status: 'Running' },
  { pid: 1024, name: 'svchost.exe', user: 'NT AUTHORITY\\LOCAL SERVICE', cpu: 1.5, memoryMb: 42, status: 'Running' },
  { pid: 3120, name: 'chrome.exe', user: 'ASTRA\\goudk', cpu: 8.4, memoryMb: 512, status: 'Running' },
  { pid: 8894, name: 'cmd.exe', user: 'ASTRA\\Administrator', cpu: 0.8, memoryMb: 18, status: 'Running' },
  { pid: 1240, name: 'explorer.exe', user: 'ASTRA\\goudk', cpu: 3.2, memoryMb: 195, status: 'Running' },
  { pid: 9940, name: 'astra-agent.exe', user: 'NT AUTHORITY\\SYSTEM', cpu: 0.5, memoryMb: 34, status: 'Running' },
];

interface SocketItem {
  proto: string;
  local: string;
  foreign: string;
  state: string;
  pid: number;
}

const INITIAL_SOCKETS: SocketItem[] = [
  { proto: 'TCP', local: '192.168.1.104:52104', foreign: '185.220.101.5:443', state: 'ESTABLISHED', pid: 4812 },
  { proto: 'TCP', local: '192.168.1.104:49670', foreign: '140.82.121.4:443', state: 'ESTABLISHED', pid: 3120 },
  { proto: 'UDP', local: '192.168.1.104:53', foreign: '1.1.1.1:53', state: 'CONNECTED', pid: 1024 },
  { proto: 'TCP', local: '192.168.1.104:8080', foreign: '127.0.0.1:58900', state: 'LISTENING', pid: 9940 },
];

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [sockets, setSockets] = useState<SocketItem[]>(INITIAL_SOCKETS);
  const [isIsolated, setIsIsolated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'ASTRA AGENT KERNEL INTERFACE CONNECTED [v2.4.0]',
    'Agent session established via WebSocket STOMP TLS',
    'Type "help" or run diagnostic commands (ipconfig, netstat, ps, kill <pid>, isolate, scan)',
  ]);
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Simulated metrics counters
  const [cpuGauge, setCpuGauge] = useState(24);
  const [ramGauge, setRamGauge] = useState(4.2);

  // Fetch real device details from backend if available
  const { data: deviceList = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    }
  });

  const device = deviceList.find((d: any) => String(d.id) === id || d.name === id) || {
    id: id || 'HOD-LAPTOP-01',
    name: id || 'HOD-LAPTOP-01',
    type: 'Laptop',
    os: 'Windows 11 Enterprise (Build 22631)',
    ipAddress: '192.168.1.104',
    status: 'Online',
    health: 'Healthy',
    agentVersion: 'v2.4.0',
    macAddress: '00:1A:2B:3C:4D:5E',
    lastSeen: 'Just now',
  };

  // Pulse CPU / RAM Gauges
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuGauge(Math.floor(18 + Math.random() * 20));
      setRamGauge(Number((4.0 + Math.random() * 0.8).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Live WebSocket updates for this device
  useEffect(() => {
    const unsubscribe = subscribe('threats', (incident: any) => {
      const threatName = incident.name || incident.type || 'Suspicious Process';
      const newProc: ProcessItem = {
        pid: Math.floor(1000 + Math.random() * 8000),
        name: threatName.toLowerCase().replace(/\s+/g, '') + '.exe',
        user: 'ASTRA\\Administrator',
        cpu: Number((15 + Math.random() * 30).toFixed(1)),
        memoryMb: Math.floor(100 + Math.random() * 300),
        status: 'High Risk',
      };
      setProcesses((prev) => [newProc, ...prev]);
      setTerminalLogs((prev) => [...prev, `[ALERT] Threat Process Detected on ${device.name}: ${newProc.name} (PID ${newProc.pid})`]);
    });
    return () => unsubscribe();
  }, [subscribe, device.name]);

  const handleKillProcess = (pid: number, procName: string) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    setTerminalLogs((prev) => [...prev, `[ACTION] Process ${procName} (PID ${pid}) FORCE TERMINATED`]);
    toast.success(`Process Terminated`, {
      description: `${procName} (PID ${pid}) killed on ${device.name}.`
    });
  };

  const handleIsolateToggle = () => {
    setIsIsolated(!isIsolated);
    const nextState = !isIsolated;
    setTerminalLogs((prev) => [
      ...prev,
      nextState 
        ? `[DEFENSE] ${device.name} NETWORK INTERFACES ISOLATED. Outbound traffic blocked.`
        : `[DEFENSE] ${device.name} Network isolation restored to Normal.`
    ]);
    if (nextState) {
      toast.error(`Endpoint Isolated`, { description: `Network interfaces disabled on ${device.name}.` });
    } else {
      toast.success(`Network Reconnected`, { description: `Normal traffic restored on ${device.name}.` });
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTerminalLogs((prev) => [...prev, `[SCAN] Initiating Deep Memory & File System Virus Scan on ${device.name}...`]);
    setTimeout(() => {
      setIsScanning(false);
      setTerminalLogs((prev) => [...prev, `[SCAN COMPLETE] 0 Threats found in 148,920 scanned memory pages.`]);
      toast.success(`Deep Scan Completed`, { description: `0 Threats found on ${device.name}.` });
    }, 3000);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim().toLowerCase();
    const newLogs = [...terminalLogs, `> ${commandInput}`];

    if (cmd === 'help') {
      newLogs.push('Available Commands: help, ipconfig, whoami, netstat, ps, kill <pid>, isolate, scan, clear');
    } else if (cmd === 'ipconfig') {
      newLogs.push(`IP Address: ${device.ipAddress}\nSubnet Mask: 255.255.255.0\nGateway: 192.168.1.1\nMAC: ${device.macAddress}`);
    } else if (cmd === 'whoami') {
      newLogs.push('ASTRA\\Administrator (Elevated System Agent Privilege)');
    } else if (cmd === 'netstat') {
      newLogs.push(`Active Sockets:\n${sockets.map(s => `${s.proto} ${s.local} -> ${s.foreign} [${s.state}]`).join('\n')}`);
    } else if (cmd === 'ps') {
      newLogs.push(`Running Processes:\n${processes.map(p => `PID ${p.pid} | ${p.name} | ${p.cpu}% CPU | ${p.memoryMb}MB`).join('\n')}`);
    } else if (cmd.startsWith('kill ')) {
      const pidNum = parseInt(cmd.split(' ')[1]);
      const target = processes.find(p => p.pid === pidNum);
      if (target) {
        handleKillProcess(target.pid, target.name);
      } else {
        newLogs.push(`Process PID ${pidNum} not found.`);
      }
    } else if (cmd === 'isolate') {
      handleIsolateToggle();
    } else if (cmd === 'scan') {
      handleRunScan();
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setCommandInput('');
      return;
    } else {
      newLogs.push(`Executing agent script: ${cmd}... [Success]`);
    }

    setTerminalLogs(newLogs);
    setCommandInput('');
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs.length]);

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
                <span className="text-white/40 block text-[10px]">CPU USAGE</span>
                <span className="text-emerald-400 font-bold text-lg">{cpuGauge}%</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">RAM MEMORY</span>
                <span className="text-cyan-300 font-bold text-lg">{ramGauge} / 16 GB</span>
              </div>
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

      {/* Screen Monitor & Hardware Gauges Row */}
      <PageSection className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Screen Simulation Viewport */}
        <Card className="lg:col-span-2 flex flex-col border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Monitor size={16} className="text-primary animate-pulse" />
              Live Screen Surveillance Viewport ({device.name})
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 1920x1080 @ 60 FPS
            </span>
          </div>

          <div className="relative flex-1 min-h-[240px] bg-black border border-primary/20 p-4 font-mono text-xs overflow-hidden group">
            {/* Cyber Grid */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Desktop Screen HUD Overlay */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2 text-white/60 text-[11px]">
                <span>Active Window: <strong className="text-primary">powershell.exe (Administrator)</strong></span>
                <span>User: <strong className="text-white">ASTRA\Administrator</strong></span>
              </div>

              <div className="p-3 bg-surface/70 border border-primary/30 text-emerald-300 font-mono text-xs space-y-1">
                <p className="text-primary font-bold">PS C:\Windows\System32&gt; Get-Process | Where-Object CPU -gt 10</p>
                <p>NPM(K)    PM(K)      WS(K)     CPU(s)      Id  SI ProcessName</p>
                <p>------    -----      -----     ------      --  -- -----------</p>
                <p className="text-danger font-bold">    48   148920     184200      14.24    4812   1 powershell [HIGH RISK]</p>
                <p>    12    88400      92100       2.10     648   0 lsass</p>
                <p>    84   512000     620000       8.40    3120   1 chrome</p>
              </div>

              <div className="text-[11px] text-white/50 flex items-center gap-2">
                <Activity size={12} className="text-primary animate-pulse" />
                <span>Zero-Trust Memory Protection & System Call Interceptor Active</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Hardware & Security Gauges */}
        <Card className="flex flex-col border-primary/30">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-4 border-b border-border-color pb-2 flex items-center gap-2">
            <Cpu size={16} className="text-primary" /> Device Telemetry Health
          </h3>

          <div className="space-y-6 flex-1 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/70">CPU Utilization</span>
                <span className="font-bold text-emerald-400">{cpuGauge}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 overflow-hidden">
                <motion.div 
                  animate={{ width: `${cpuGauge}%` }} 
                  transition={{ duration: 0.8 }}
                  className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/70">RAM Memory (16 GB)</span>
                <span className="font-bold text-cyan-300">{ramGauge} GB</span>
              </div>
              <div className="h-2 w-full bg-white/10 overflow-hidden">
                <motion.div 
                  animate={{ width: `${(ramGauge / 16) * 100}%` }} 
                  transition={{ duration: 0.8 }}
                  className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(5,217,232,0.8)]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/70">Disk Storage (C:\)</span>
                <span className="font-bold text-warning">142 / 512 GB (27%)</span>
              </div>
              <div className="h-2 w-full bg-white/10 overflow-hidden">
                <div className="h-full w-[27%] bg-warning shadow-[0_0_10px_rgba(243,230,0,0.8)]" />
              </div>
            </div>

            <div className="p-3 bg-surface/50 border border-white/10 space-y-1 text-[11px]">
              <div className="text-primary font-bold uppercase">Endpoint Shield Status</div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle size={14} /> Real-Time Memory Protection Active
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle size={14} /> Ransomware Trap Watchers Deployed
              </div>
            </div>
          </div>
        </Card>
      </PageSection>

      {/* Task Manager / Running Processes Row */}
      <PageSection>
        <Card className="border-primary/30">
          <div className="flex items-center justify-between mb-4 border-b border-border-color pb-3 font-mono">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                Live Task Manager — Processes on {device.name} ({processes.length})
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Real-time processes running on agent. Click Kill Process to terminate instantly.</p>
            </div>

            <span className="text-xs text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/30">
              AGENT TELEMETRY HOOK ACTIVE
            </span>
          </div>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Process Name</th>
                  <th className="py-2.5 px-3">User / Owner</th>
                  <th className="py-2.5 px-3">CPU %</th>
                  <th className="py-2.5 px-3">Memory (MB)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {processes.map((proc) => (
                    <motion.tr
                      key={proc.pid}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-white/60">{proc.pid}</td>
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        {proc.name}
                        {proc.status === 'High Risk' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-danger/20 text-danger border border-danger/40 animate-pulse">
                            HIGH RISK
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-white/70">{proc.user}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{proc.cpu}%</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">{proc.memoryMb} MB</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={proc.status === 'High Risk' ? 'danger' : 'success'}>
                          {proc.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleKillProcess(proc.pid, proc.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-danger/20 hover:bg-danger/40 text-danger border border-danger/50 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Trash2 size={12} /> Kill
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </PageSection>

      {/* Interactive Web Terminal & Sockets Row */}
      <PageSection className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Interactive Web Command Terminal */}
        <Card className="flex flex-col border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              Interactive Agent Terminal ({device.name})
            </h3>
            <span className="text-[10px] text-white/40">Direct C2 Socket Connection</span>
          </div>

          <div className="flex-1 bg-black border border-primary/30 p-3 text-xs overflow-y-auto max-h-64 space-y-1">
            {terminalLogs.map((log, idx) => (
              <p key={idx} className={log.startsWith('>') ? 'text-primary font-bold' : log.includes('[ALERT]') ? 'text-danger font-bold' : 'text-white/80'}>
                {log}
              </p>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center gap-2">
            <span className="text-primary font-bold text-xs">{'>'}</span>
            <input
              type="text"
              placeholder="Type command (e.g. help, ipconfig, ps, kill 4812, isolate)..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-surface border border-white/20 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Send
            </Button>
          </form>
        </Card>

        {/* Network Sockets Table */}
        <Card className="flex flex-col border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Wifi size={16} className="text-cyan-400" />
              Active Network Sockets ({device.name})
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">{sockets.length} Open Sockets</span>
          </div>

          <div className="overflow-x-auto text-xs flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase">
                  <th className="py-2 px-2">Proto</th>
                  <th className="py-2 px-2">Local Address</th>
                  <th className="py-2 px-2">Foreign Address</th>
                  <th className="py-2 px-2">State</th>
                  <th className="py-2 px-2 text-right">PID</th>
                </tr>
              </thead>
              <tbody>
                {sockets.map((s, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 font-bold text-cyan-300">{s.proto}</td>
                    <td className="py-2 px-2 text-white/80">{s.local}</td>
                    <td className="py-2 px-2 text-primary font-bold">{s.foreign}</td>
                    <td className="py-2 px-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {s.state}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-white/60">{s.pid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
