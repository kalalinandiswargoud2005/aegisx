import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Eye, Laptop, Server, Activity, ShieldAlert, Cpu, Terminal, 
  Search, Lock, Play, Pause, AlertOctagon, ArrowUpRight, Wifi, 
  ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Trash2, 
  RotateCcw, Monitor, CheckCircle, XCircle, ShieldCheck, Zap, HardDrive, Filter, ChevronRight, CornerDownLeft
} from 'lucide-react';
import { Card, Button, Badge, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export interface MonitoredDevice {
  id: string;
  name: string;
  type: 'Laptop' | 'Server' | 'Workstation' | 'Hub' | 'Appliance';
  os: string;
  ip: string;
  mac: string;
  status: 'Online' | 'Warning' | 'Critical' | 'Offline';
  health: 'Healthy' | 'Warning' | 'Critical';
  cpu: number;
  ram: number;
  ramTotal: number;
  disk: string;
  threatCount: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  agentVersion: string;
  activeProcess: string;
  isIsolated?: boolean;
}

const DEFAULT_DEVICES: MonitoredDevice[] = [
  {
    id: 'HOD-LAPTOP-01',
    name: 'HOD-LAPTOP-01',
    type: 'Laptop',
    os: 'Windows 11 Enterprise (Build 22631)',
    ip: '192.168.1.104',
    mac: '00:1A:2B:3C:4D:5E',
    status: 'Online',
    health: 'Healthy',
    cpu: 24,
    ram: 4.2,
    ramTotal: 16,
    disk: '142 / 512 GB',
    threatCount: 2,
    risk: 'Medium',
    agentVersion: 'v2.4.0',
    activeProcess: 'powershell.exe',
    isIsolated: false,
  },
  {
    id: 'WIN-SRV-NORTH',
    name: 'WIN-SRV-NORTH',
    type: 'Server',
    os: 'Windows Server 2022 Datacenter',
    ip: '10.0.4.12',
    mac: '00:50:56:9A:12:34',
    status: 'Warning',
    health: 'Warning',
    cpu: 62,
    ram: 12.8,
    ramTotal: 32,
    disk: '420 / 1024 GB',
    threatCount: 4,
    risk: 'High',
    agentVersion: 'v2.4.0',
    activeProcess: 'lsass.exe',
    isIsolated: false,
  },
  {
    id: 'DEV-DESKTOP-04',
    name: 'DEV-DESKTOP-04',
    type: 'Workstation',
    os: 'Ubuntu 24.04 LTS (Noble Numbat)',
    ip: '192.168.1.150',
    mac: '70:85:C2:DF:11:99',
    status: 'Online',
    health: 'Healthy',
    cpu: 12,
    ram: 6.1,
    ramTotal: 32,
    disk: '88 / 1000 GB',
    threatCount: 0,
    risk: 'Low',
    agentVersion: 'v2.4.0',
    activeProcess: 'git.exe',
    isIsolated: false,
  },
  {
    id: 'FINANCE-PC-02',
    name: 'FINANCE-PC-02',
    type: 'Laptop',
    os: 'Windows 10 Pro 64-bit',
    ip: '192.168.1.88',
    mac: 'A4:BB:6D:E1:22:88',
    status: 'Online',
    health: 'Healthy',
    cpu: 8,
    ram: 3.8,
    ramTotal: 16,
    disk: '210 / 512 GB',
    threatCount: 1,
    risk: 'Low',
    agentVersion: 'v2.3.9',
    activeProcess: 'excel.exe',
    isIsolated: false,
  },
  {
    id: 'C2-GATEWAY-LINUX',
    name: 'C2-GATEWAY-LINUX',
    type: 'Server',
    os: 'Debian 12 Bookworm (Kernel 6.8)',
    ip: '10.0.4.15',
    mac: '52:54:00:12:34:56',
    status: 'Critical',
    health: 'Critical',
    cpu: 88,
    ram: 28.4,
    ramTotal: 64,
    disk: '850 / 2048 GB',
    threatCount: 5,
    risk: 'Critical',
    agentVersion: 'v2.4.0',
    activeProcess: 'cobalt-beacon',
    isIsolated: false,
  },
  {
    id: 'IOT-SENSOR-HUB-04',
    name: 'IOT-SENSOR-HUB-04',
    type: 'Hub',
    os: 'FreeRTOS v10.4.3 Embedded',
    ip: '192.168.1.205',
    mac: 'EC:FA:BC:11:22:33',
    status: 'Online',
    health: 'Healthy',
    cpu: 5,
    ram: 0.8,
    ramTotal: 2,
    disk: '4 / 16 GB',
    threatCount: 0,
    risk: 'Low',
    agentVersion: 'v2.1.0',
    activeProcess: 'npu-stream.elf',
    isIsolated: false,
  },
  {
    id: 'HARDWARE-APPLIANCE-01',
    name: 'HARDWARE-APPLIANCE-01',
    type: 'Appliance',
    os: 'ASTRA Secure OS (FIPS Enclave)',
    ip: '127.0.0.1',
    mac: '00:00:00:00:00:01',
    status: 'Online',
    health: 'Healthy',
    cpu: 15,
    ram: 2.4,
    ramTotal: 8,
    disk: '32 / 256 GB',
    threatCount: 1,
    risk: 'Medium',
    agentVersion: 'v2.4.0',
    activeProcess: 'enclave-watchdog',
    isIsolated: false,
  },
  {
    id: 'WORKSTATION-SEC-04',
    name: 'WORKSTATION-SEC-04',
    type: 'Workstation',
    os: 'Windows 11 Enterprise SEC',
    ip: '192.168.1.112',
    mac: '3C:D9:2B:44:55:66',
    status: 'Online',
    health: 'Healthy',
    cpu: 19,
    ram: 8.2,
    ramTotal: 16,
    disk: '180 / 512 GB',
    threatCount: 1,
    risk: 'Medium',
    agentVersion: 'v2.4.0',
    activeProcess: 'msedge.exe',
    isIsolated: false,
  }
];

export function Watch() {
  const { subscribe } = useWebSocket();
  const [deviceList, setDeviceList] = useState<MonitoredDevice[]>(DEFAULT_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<MonitoredDevice | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'THREATS' | 'PROCESSES' | 'TERMINAL' | 'RECOVERY'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Per-Device State Data
  const [deviceProcesses, setDeviceProcesses] = useState<Record<string, any[]>>({
    'HOD-LAPTOP-01': [
      { pid: 4812, name: 'powershell.exe', user: 'ASTRA\\Administrator', cpu: 14.2, memoryMb: 145, status: 'High Risk' },
      { pid: 648, name: 'lsass.exe', user: 'NT AUTHORITY\\SYSTEM', cpu: 2.1, memoryMb: 88, status: 'Running' },
      { pid: 1024, name: 'svchost.exe', user: 'NT AUTHORITY\\LOCAL SERVICE', cpu: 1.5, memoryMb: 42, status: 'Running' },
      { pid: 3120, name: 'chrome.exe', user: 'ASTRA\\goudk', cpu: 8.4, memoryMb: 512, status: 'Running' },
    ],
    'WIN-SRV-NORTH': [
      { pid: 902, name: 'lsass.exe', user: 'NT AUTHORITY\\SYSTEM', cpu: 22.4, memoryMb: 320, status: 'High Risk' },
      { pid: 1440, name: 'cmd.exe', user: 'NT AUTHORITY\\SYSTEM', cpu: 12.1, memoryMb: 95, status: 'High Risk' },
      { pid: 2048, name: 'sqlservr.exe', user: 'NT SERVICE\\MSSQLSERVER', cpu: 28.5, memoryMb: 4096, status: 'Running' },
    ],
    'C2-GATEWAY-LINUX': [
      { pid: 8812, name: 'cobalt-beacon', user: 'root', cpu: 45.8, memoryMb: 680, status: 'High Risk' },
      { pid: 7720, name: 'eBPF-probe', user: 'root', cpu: 12.0, memoryMb: 120, status: 'Running' },
    ]
  });

  const [deviceThreats, setDeviceThreats] = useState<Record<string, any[]>>({
    'HOD-LAPTOP-01': [
      { id: 'TR-9042', name: 'Ransomware.WannaCry.Payload', severity: 'CRITICAL', vector: 'SMBv1 RCE Exploit', status: 'CONTAINED', time: '10 mins ago' },
      { id: 'TR-4105', name: 'Unauthorized PowerShell Execution', severity: 'MEDIUM', vector: 'Script Execution', status: 'BLOCKED', time: '1 hour ago' }
    ],
    'WIN-SRV-NORTH': [
      { id: 'TR-8819', name: 'LSASS Process Memory Dumping', severity: 'HIGH', vector: 'Mimikatz Pass-the-Hash', status: 'BLOCKED', time: '25 mins ago' },
      { id: 'TR-7711', name: 'Unauthorized Registry Persistence', severity: 'HIGH', vector: 'HKLM Run Key Modification', status: 'CONTAINED', time: '40 mins ago' }
    ],
    'C2-GATEWAY-LINUX': [
      { id: 'TR-9901', name: 'Kernel eBPF Raw Socket Injection', severity: 'CRITICAL', vector: '/dev/net/tun0 Tamper', status: 'CONTAINED', time: '5 mins ago' },
      { id: 'TR-9902', name: 'Outbound C2 Egress Beacon', severity: 'CRITICAL', vector: 'Encrypted TLS Tunnel', status: 'BLOCKED', time: '12 mins ago' }
    ]
  });

  const [deviceLogs, setDeviceLogs] = useState<Record<string, string[]>>({});
  const [commandInput, setCommandInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize terminal logs for selected device
  useEffect(() => {
    if (selectedDevice && !deviceLogs[selectedDevice.id]) {
      setDeviceLogs((prev) => ({
        ...prev,
        [selectedDevice.id]: [
          `ASTRA AGENT KERNEL LINK ESTABLISHED FOR [${selectedDevice.name}]`,
          `Host IP: ${selectedDevice.ip} | OS: ${selectedDevice.os}`,
          `Shield Mode: Active | Telemetry Probe: Online`,
          `Type "help" for available C2 commands (ipconfig, ps, kill <pid>, isolate, scan, rollback, clear)`
        ]
      }));
    }
  }, [selectedDevice]);

  // Pulse CPU / RAM Metrics dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceList((prev) =>
        prev.map((dev) => ({
          ...dev,
          cpu: Math.max(4, Math.min(95, dev.cpu + Math.floor((Math.random() - 0.5) * 8))),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered devices for the main Watch Deck grid
  const filteredDevices = useMemo(() => {
    return deviceList.filter((dev) => {
      const matchesRisk = filterRisk === 'ALL' || dev.risk.toUpperCase() === filterRisk;
      const matchesSearch = 
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRisk && matchesSearch;
    });
  }, [deviceList, filterRisk, searchQuery]);

  // Device isolation handler
  const handleToggleIsolate = (devId: string) => {
    setDeviceList((prev) =>
      prev.map((d) => {
        if (d.id === devId) {
          const nextState = !d.isIsolated;
          if (nextState) {
            toast.error(`Endpoint ${d.name} Isolated`, {
              description: 'Network socket interfaces disabled. Egress traffic blocked.'
            });
          } else {
            toast.success(`Endpoint ${d.name} Reconnected`, {
              description: 'Normal network interface traffic restored.'
            });
          }
          return { ...d, isIsolated: nextState };
        }
        return d;
      })
    );
  };

  // Kill Process on selected device
  const handleKillProcess = (devId: string, pid: number, procName: string) => {
    setDeviceProcesses((prev) => ({
      ...prev,
      [devId]: (prev[devId] || []).filter((p) => p.pid !== pid)
    }));
    
    // Add to terminal log
    if (selectedDevice) {
      setDeviceLogs((prev) => ({
        ...prev,
        [devId]: [...(prev[devId] || []), `[ACTION] Process ${procName} (PID ${pid}) FORCE TERMINATED.`]
      }));
    }

    toast.success(`Terminated Process on ${devId}`, {
      description: `${procName} (PID ${pid}) killed successfully.`
    });
  };

  // Deep Virus Scan
  const handleRunScan = (devId: string) => {
    setIsScanning(true);
    toast.info(`Initiating Memory Scan on ${devId}...`);
    
    setTimeout(() => {
      setIsScanning(false);
      toast.success(`Deep Memory Scan Complete on ${devId}`, {
        description: `Scanned 148,920 memory pages. 0 active threats detected.`
      });
      if (selectedDevice) {
        setDeviceLogs((prev) => ({
          ...prev,
          [devId]: [...(prev[devId] || []), `[SCAN COMPLETE] 0 Threats found in memory pages.`]
        }));
      }
    }, 2500);
  };

  // Rollback System Snapshot
  const handleRollbackSnapshot = (devId: string, snapshotName: string) => {
    toast.success(`System Rollback Initiated on ${devId}`, {
      description: `Restoring tamper-proof FIPS 140-3 snapshot (${snapshotName})...`
    });
    if (selectedDevice) {
      setDeviceLogs((prev) => ({
        ...prev,
        [devId]: [...(prev[devId] || []), `[RECOVERY] Restored system volume state to ${snapshotName}.`]
      }));
    }
  };

  // Terminal Command Submit
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || !selectedDevice) return;

    const devId = selectedDevice.id;
    const cmd = commandInput.trim().toLowerCase();
    const currentLogs = deviceLogs[devId] || [];
    const newLogs = [...currentLogs, `> ${commandInput}`];

    if (cmd === 'help') {
      newLogs.push('Available Commands: help, ipconfig, whoami, ps, kill <pid>, isolate, scan, rollback, clear');
    } else if (cmd === 'ipconfig') {
      newLogs.push(`IP Address: ${selectedDevice.ip}\nSubnet: 255.255.255.0\nMAC: ${selectedDevice.mac}\nAgent: ${selectedDevice.agentVersion}`);
    } else if (cmd === 'whoami') {
      newLogs.push(`ASTRA\\SystemAgent (${selectedDevice.name}) - Elevated Privilege`);
    } else if (cmd === 'ps') {
      const procs = deviceProcesses[devId] || [];
      newLogs.push(`Running Processes:\n${procs.map(p => `PID ${p.pid} | ${p.name} | ${p.cpu}% CPU | ${p.memoryMb}MB`).join('\n')}`);
    } else if (cmd.startsWith('kill ')) {
      const pidNum = parseInt(cmd.split(' ')[1]);
      const procs = deviceProcesses[devId] || [];
      const target = procs.find(p => p.pid === pidNum);
      if (target) {
        handleKillProcess(devId, target.pid, target.name);
      } else {
        newLogs.push(`Process PID ${pidNum} not found.`);
      }
    } else if (cmd === 'isolate') {
      handleToggleIsolate(devId);
      newLogs.push(`Toggled network isolation status for ${devId}.`);
    } else if (cmd === 'scan') {
      handleRunScan(devId);
    } else if (cmd === 'clear') {
      setDeviceLogs(prev => ({ ...prev, [devId]: [] }));
      setCommandInput('');
      return;
    } else {
      newLogs.push(`Executing C2 script: ${cmd}... [Done]`);
    }

    setDeviceLogs(prev => ({ ...prev, [devId]: newLogs }));
    setCommandInput('');
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [deviceLogs]);

  // Selected Device Object with latest state
  const currentSelectedDevice = useMemo(() => {
    if (!selectedDevice) return null;
    return deviceList.find(d => d.id === selectedDevice.id) || selectedDevice;
  }, [selectedDevice, deviceList]);

  return (
    <PageContainer className="animate-in fade-in duration-300 space-y-6 pb-12">
      
      {/* ── IF NO DEVICE SELECTED: RENDER WATCH DECK DEVICE BOXES GRID ── */}
      {!currentSelectedDevice ? (
        <>
          {/* Header & Controls */}
          <PageHeader 
            title="Watch Deck & Endpoint Surveillance Grid"
            description="Select any monitored endpoint to launch its dedicated per-device dashboard and control center."
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-white/40" size={15} />
                <input
                  type="text"
                  placeholder="Search endpoint name, IP, OS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-surface-light/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              {/* Risk Filter */}
              <div className="flex items-center gap-1 bg-surface-light/40 border border-white/15 rounded-lg p-1 font-mono text-[11px]">
                <Filter size={13} className="text-white/40 ml-2 mr-1" />
                {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRisk(r)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      filterRisk === r
                        ? 'bg-primary text-black font-bold shadow-[0_0_10px_#05d9e8]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/40 text-xs font-mono font-bold text-primary shadow-[0_0_10px_rgba(5,217,232,0.2)]">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                {deviceList.length} ENDPOINTS MONITORED
              </span>
            </div>
          </PageHeader>

          {/* Quick Telemetry KPI Bar */}
          <PageSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-4 border-primary/30 bg-gradient-to-br from-surface to-primary/10">
              <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/40">
                <Laptop size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/50 uppercase">Active Endpoints</span>
                <div className="text-2xl font-space font-bold text-white">{deviceList.length} Devices</div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 border-emerald-500/30 bg-gradient-to-br from-surface to-emerald-500/10">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/50 uppercase">Telemetry Pulse Rate</span>
                <div className="text-2xl font-space font-bold text-emerald-400">540 Events/sec</div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 border-amber-500/30 bg-gradient-to-br from-surface to-amber-500/10">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/50 uppercase">Process Interceptions</span>
                <div className="text-2xl font-space font-bold text-amber-400">142 Hooks</div>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 border-danger/30 bg-gradient-to-br from-surface to-danger/10">
              <div className="p-3 rounded-xl bg-danger/20 text-danger border border-danger/40">
                <ShieldAlert size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/50 uppercase">Active Device Threats</span>
                <div className="text-2xl font-space font-bold text-danger">
                  {deviceList.reduce((acc, d) => acc + d.threatCount, 0)} Flags
                </div>
              </div>
            </Card>
          </PageSection>

          {/* Device Boxes Grid */}
          <PageSection>
            <Card className="p-6 border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-space font-bold text-white flex items-center gap-2">
                    <Eye size={22} className="text-primary animate-pulse" />
                    Monitored Endpoints Grid
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">Click any device box below to open its dedicated dashboard kiosk.</p>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 font-mono text-xs px-3 py-1">
                  Showing {filteredDevices.length} Devices
                </Badge>
              </div>

              {/* Grid of Interactive Device Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDevices.map((dev) => (
                  <motion.div
                    key={dev.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => {
                      setSelectedDevice(dev);
                      setActiveTab('OVERVIEW');
                    }}
                    className={`relative p-5 rounded-2xl bg-gradient-to-b from-surface-light/40 via-surface/60 to-surface-light/20 border transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${
                      dev.isIsolated
                        ? 'border-danger/80 bg-danger/10 shadow-[0_0_25px_rgba(255,61,113,0.3)]'
                        : dev.risk === 'Critical'
                        ? 'border-danger/60 hover:border-danger shadow-[0_0_20px_rgba(255,61,113,0.2)]'
                        : dev.risk === 'High'
                        ? 'border-amber-500/50 hover:border-amber-400'
                        : 'border-white/15 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(5,217,232,0.25)]'
                    }`}
                  >
                    {/* Header: Icon, Name & Risk Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl border flex items-center justify-center ${
                          dev.type === 'Server' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                          dev.type === 'Hub' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                          dev.type === 'Appliance' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          'bg-primary/20 text-primary border-primary/40'
                        }`}>
                          {dev.type === 'Server' ? <Server size={22} /> : <Laptop size={22} />}
                        </div>
                        <div>
                          <h4 className="font-space font-bold text-white text-base group-hover:text-primary transition-colors">
                            {dev.name}
                          </h4>
                          <span className="text-[10px] font-mono text-white/50 block">{dev.os.split(' ')[0]} {dev.os.split(' ')[1]}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[10px] rounded-md font-mono font-bold uppercase ${
                        dev.risk === 'Critical' ? 'bg-danger/20 text-danger border border-danger/40 animate-pulse' :
                        dev.risk === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        dev.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {dev.risk}
                      </span>
                    </div>

                    {/* Status & Telemetry Details */}
                    <div className="space-y-2 font-mono text-xs pt-1 text-white/70">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/40">IP Address:</span>
                        <span className="font-bold text-primary">{dev.ip}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/40">Shield Status:</span>
                        <span className={`font-bold ${dev.isIsolated ? 'text-danger' : 'text-emerald-400'}`}>
                          {dev.isIsolated ? 'ISOLATED' : dev.status}
                        </span>
                      </div>

                      {/* CPU Utilization Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/40">CPU Utilization</span>
                          <span className="text-emerald-400 font-bold">{dev.cpu}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              dev.cpu > 80 ? 'bg-danger' : dev.cpu > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${dev.cpu}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Trigger Button */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs text-primary group-hover:text-cyan-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Monitor size={14} /> Open Device Dashboard
                      </span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </PageSection>
        </>
      ) : (
        /* ── IF DEVICE SELECTED: RENDER DEDICATED PER-DEVICE APP DASHBOARD ── */
        <div className="space-y-6">
          
          {/* Top Back & Device Control Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-primary/40 shadow-[0_0_30px_rgba(5,217,232,0.2)]">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDevice(null)}
                className="flex items-center gap-2 font-mono text-xs border-white/20 text-white hover:border-primary"
              >
                <ArrowLeft size={16} />
                <span>All Devices Grid</span>
              </Button>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/40">
                  {currentSelectedDevice.type === 'Server' ? <Server size={26} /> : <Laptop size={26} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-space font-extrabold text-white">{currentSelectedDevice.name}</h2>
                    <Badge variant={currentSelectedDevice.isIsolated ? 'danger' : 'success'} className="font-mono text-xs">
                      {currentSelectedDevice.isIsolated ? 'ISOLATED' : currentSelectedDevice.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-primary font-mono mt-0.5">
                    IP: {currentSelectedDevice.ip} | MAC: {currentSelectedDevice.mac} | OS: {currentSelectedDevice.os}
                  </p>
                </div>
              </div>
            </div>

            {/* Device Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <Button
                variant={currentSelectedDevice.isIsolated ? "primary" : "danger"}
                size="sm"
                onClick={() => handleToggleIsolate(currentSelectedDevice.id)}
                className="flex items-center gap-1.5 font-bold"
              >
                <Lock size={14} />
                {currentSelectedDevice.isIsolated ? 'Restore Network' : 'Isolate Endpoint'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRunScan(currentSelectedDevice.id)}
                disabled={isScanning}
                className="flex items-center gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
              >
                <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
                {isScanning ? 'Scanning Memory...' : 'Run Virus Scan'}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs Bar for Selected Device */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-white/10 font-mono text-xs overflow-x-auto">
            {[
              { id: 'OVERVIEW', label: 'Device Telemetry Overview', icon: Monitor },
              { id: 'THREATS', label: `Device Threat Center (${(deviceThreats[currentSelectedDevice.id] || []).length})`, icon: ShieldAlert },
              { id: 'PROCESSES', label: `Process Task Manager (${(deviceProcesses[currentSelectedDevice.id] || []).length})`, icon: Activity },
              { id: 'TERMINAL', label: 'C2 Interactive Terminal', icon: Terminal },
              { id: 'RECOVERY', label: 'System Snapshots & Recovery', icon: RotateCcw },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(5,217,232,0.4)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: DEVICE OVERVIEW & HARDWARE GAUGES ── */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Desktop Viewport Simulation */}
                <Card className="lg:col-span-2 p-6 border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-base font-space font-bold text-white flex items-center gap-2">
                      <Monitor size={18} className="text-primary animate-pulse" />
                      Live Desktop Viewport Stream ({currentSelectedDevice.name})
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 1920x1080 @ 60 FPS
                    </span>
                  </div>

                  <div className="relative min-h-[260px] bg-black rounded-xl border border-primary/30 p-5 font-mono text-xs space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 text-white/60">
                      <span>Active Foreground Process: <strong className="text-primary">{currentSelectedDevice.activeProcess}</strong></span>
                      <span>User: <strong className="text-white">ASTRA\Administrator</strong></span>
                    </div>

                    <div className="p-4 rounded-lg bg-surface-light/40 border border-primary/30 text-emerald-300 space-y-2">
                      <p className="text-primary font-bold">PS C:\Windows\System32&gt; Get-AegisShieldTelemetry -Host "{currentSelectedDevice.name}"</p>
                      <p className="text-white/70">Kernel Hook State: ACTIVE | DEP/ASLR: ENABLED | FIPS Enclave: OK</p>
                      <p className="text-cyan-300">Memory Integrity Watchdog: 0 Violations (148,920 pages clean)</p>
                      <p className="text-amber-300">Socket Probe Status: Monitoring TCP/UDP port streams</p>
                    </div>

                    <div className="text-[11px] text-white/40 flex items-center justify-between pt-2">
                      <span>Agent Version: {currentSelectedDevice.agentVersion}</span>
                      <span className="text-emerald-400">Zero-Trust Realtime Isolation Ready</span>
                    </div>
                  </div>
                </Card>

                {/* Hardware Telemetry Gauges */}
                <Card className="p-6 border-white/10 flex flex-col justify-between">
                  <div className="border-b border-white/10 pb-3 mb-4">
                    <h3 className="text-base font-space font-bold text-white flex items-center gap-2">
                      <Cpu size={18} className="text-primary" />
                      Hardware Telemetry Gauges
                    </h3>
                  </div>

                  <div className="space-y-6 font-mono text-xs">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">CPU Utilization</span>
                        <span className="font-bold text-emerald-400">{currentSelectedDevice.cpu}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]" style={{ width: `${currentSelectedDevice.cpu}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">RAM Memory ({currentSelectedDevice.ramTotal} GB)</span>
                        <span className="font-bold text-cyan-300">{currentSelectedDevice.ram} GB</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 shadow-[0_0_10px_#05d9e8]" style={{ width: `${(currentSelectedDevice.ram / currentSelectedDevice.ramTotal) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/70">Disk Storage</span>
                        <span className="font-bold text-amber-400">{currentSelectedDevice.disk}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" style={{ width: '32%' }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-light/40 border border-white/10 space-y-1.5">
                      <span className="text-primary font-bold uppercase text-[11px] block">Appliance Status</span>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle size={14} /> Real-Time Memory Protection
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle size={14} /> Ransomware Trap Sensor Active
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── TAB 2: DEVICE THREAT CENTER ── */}
          {activeTab === 'THREATS' && (
            <Card className="p-6 border-white/10 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-space font-bold text-white flex items-center gap-2">
                    <ShieldAlert size={20} className="text-danger" />
                    Dedicated Threat Center — {currentSelectedDevice.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">List of security incidents detected specifically on this device.</p>
                </div>
                <Badge variant="danger" className="font-mono text-xs px-3 py-1">
                  {(deviceThreats[currentSelectedDevice.id] || []).length} Active Incidents
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-light/20">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="border-b border-white/10 text-white/50 bg-[#0B1220] uppercase">
                    <tr>
                      <th className="py-3 px-4">Threat ID</th>
                      <th className="py-3 px-4">Threat Name</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Attack Vector</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(deviceThreats[currentSelectedDevice.id] || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-white/40">
                          No threats detected on {currentSelectedDevice.name}. Endpoint is fully secure.
                        </td>
                      </tr>
                    ) : (
                      (deviceThreats[currentSelectedDevice.id] || []).map((t) => (
                        <tr key={t.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-primary">#{t.id}</td>
                          <td className="py-3 px-4 font-bold text-white">{t.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              t.severity === 'CRITICAL' ? 'bg-danger/20 text-danger border border-danger/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {t.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white/70">{t.vector}</td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">{t.status}</td>
                          <td className="py-3 px-4 text-white/50">{t.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── TAB 3: PROCESS TASK MANAGER ── */}
          {activeTab === 'PROCESSES' && (
            <Card className="p-6 border-white/10 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-space font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Task Manager — Processes on {currentSelectedDevice.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">Real-time processes running on this endpoint agent. Click Kill to terminate instantly.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-light/20">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="border-b border-white/10 text-white/50 bg-[#0B1220] uppercase">
                    <tr>
                      <th className="py-3 px-4">PID</th>
                      <th className="py-3 px-4">Process Name</th>
                      <th className="py-3 px-4">User / Owner</th>
                      <th className="py-3 px-4">CPU %</th>
                      <th className="py-3 px-4">Memory</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(deviceProcesses[currentSelectedDevice.id] || []).map((proc) => (
                      <tr key={proc.pid} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white/60">{proc.pid}</td>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {proc.name}
                          {proc.status === 'High Risk' && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-danger/20 text-danger border border-danger/40 font-bold">
                              HIGH RISK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white/70">{proc.user}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{proc.cpu}%</td>
                        <td className="py-3 px-4 text-cyan-300 font-bold">{proc.memoryMb} MB</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleKillProcess(currentSelectedDevice.id, proc.pid, proc.name)}
                            className="h-7 px-2.5 text-[11px] font-bold"
                          >
                            <Trash2 size={12} className="mr-1" /> Kill
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── TAB 4: C2 INTERACTIVE TERMINAL ── */}
          {activeTab === 'TERMINAL' && (
            <Card className="p-6 border-white/10 space-y-4 font-mono animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal size={18} className="text-primary" />
                  Interactive Agent C2 Terminal ({currentSelectedDevice.name})
                </h3>
                <span className="text-xs text-emerald-400">Direct Agent Socket Connected</span>
              </div>

              <div className="bg-black rounded-xl border border-primary/30 p-4 text-xs space-y-1.5 max-h-72 overflow-y-auto">
                {(deviceLogs[currentSelectedDevice.id] || []).map((log, idx) => (
                  <p key={idx} className={log.startsWith('>') ? 'text-primary font-bold' : log.includes('[ACTION]') || log.includes('[RECOVERY]') ? 'text-amber-300 font-bold' : 'text-white/80'}>
                    {log}
                  </p>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2">
                <span className="text-primary font-bold text-sm">{'>'}</span>
                <input
                  type="text"
                  placeholder="Type command (help, ipconfig, ps, kill 4812, isolate, scan, rollback, clear)..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="flex-1 bg-surface-light/40 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                />
                <Button type="submit" variant="primary" size="sm" className="font-bold text-black bg-primary">
                  Send
                </Button>
              </form>
            </Card>
          )}

          {/* ── TAB 5: SYSTEM RECOVERY & SNAPSHOTS ── */}
          {activeTab === 'RECOVERY' && (
            <Card className="p-6 border-white/10 space-y-4 font-mono animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-space font-bold text-white flex items-center gap-2">
                    <RotateCcw size={20} className="text-primary" />
                    System Recovery & Volume Snapshots — {currentSelectedDevice.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">Tamper-proof FIPS 140-3 VSS volume shadow copy recovery points.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'VSS-SNAPSHOT-2026-08-13-2000', size: '14.2 GB', type: 'Pre-Incident Shadow Copy', date: 'Today 20:00' },
                  { name: 'VSS-SNAPSHOT-2026-08-13-1200', size: '14.0 GB', type: 'Daily Automated Backup', date: 'Today 12:00' },
                  { name: 'VSS-SNAPSHOT-2026-08-12-0000', size: '13.8 GB', type: 'System Restore Baseline', date: 'Yesterday 00:00' }
                ].map((snap, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-light/30 border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] text-primary font-bold uppercase">{snap.type}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{snap.name}</h4>
                      <p className="text-xs text-white/50 mt-1">Size: {snap.size} | {snap.date}</p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRollbackSnapshot(currentSelectedDevice.id, snap.name)}
                      className="w-full text-black font-bold bg-primary hover:bg-cyan-300 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <RotateCcw size={14} /> Restore Snapshot
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}

    </PageContainer>
  );
}
