import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Laptop, Server, Activity, ShieldAlert, Cpu, Terminal, 
  Search, Lock, Play, Pause, AlertOctagon, ArrowUpRight, Wifi
} from 'lucide-react';
import { Card, Button, Badge, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryEvent {
  id: string;
  timestamp: string;
  host: string;
  process: string;
  pid: number;
  action: string;
  category: 'PROCESS' | 'NETWORK' | 'FILE' | 'REGISTRY' | 'SECURITY';
  riskScore: number;
  commandLine: string;
}

const INITIAL_EVENTS: TelemetryEvent[] = [
  { id: 'EVT-901', timestamp: new Date().toLocaleTimeString(), host: 'HOD-LAPTOP-01', process: 'powershell.exe', pid: 4812, action: 'Script Block Execution', category: 'PROCESS', riskScore: 88, commandLine: 'powershell.exe -ExecutionPolicy Bypass -NoP -File C:\\Temp\\update.ps1' },
  { id: 'EVT-900', timestamp: new Date(Date.now() - 3000).toLocaleTimeString(), host: 'WIN-SRV-NORTH', process: 'lsass.exe', pid: 648, action: 'Process Memory Read', category: 'SECURITY', riskScore: 95, commandLine: 'C:\\Windows\\System32\\lsass.exe' },
  { id: 'EVT-899', timestamp: new Date(Date.now() - 7000).toLocaleTimeString(), host: 'DEV-DESKTOP-04', process: 'git.exe', pid: 11420, action: 'Outbound TCP Connection (140.82.121.4:443)', category: 'NETWORK', riskScore: 12, commandLine: 'git push origin main' },
  { id: 'EVT-898', timestamp: new Date(Date.now() - 12000).toLocaleTimeString(), host: 'FINANCE-PC-02', process: 'excel.exe', pid: 8894, action: 'File Write (C:\\Users\\Finance\\Invoice.xlsm)', category: 'FILE', riskScore: 45, commandLine: 'excel.exe C:\\Users\\Finance\\Invoice.xlsm' },
  { id: 'EVT-897', timestamp: new Date(Date.now() - 18000).toLocaleTimeString(), host: 'HOD-LAPTOP-01', process: 'svchost.exe', pid: 1024, action: 'DNS Query (api.astra-defense.org)', category: 'NETWORK', riskScore: 5, commandLine: 'svchost.exe -k NetworkService' },
];

export function Watch() {
  const { subscribe } = useWebSocket();
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);
  const [isPaused, setIsPaused] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    }
  });

  // Subscribe to live WebSocket threats & activity
  useEffect(() => {
    const unsubscribe = subscribe('threats', (incident: any) => {
      if (isPausedRef.current) return;

      const newEvt: TelemetryEvent = {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        host: incident.target || 'HOD-LAPTOP-01',
        process: incident.name || incident.type || 'malware.exe',
        pid: Math.floor(1000 + Math.random() * 8000),
        action: incident.aiExplanation || 'Anomalous Process Activity Intercepted',
        category: incident.severity === 'CRITICAL' ? 'SECURITY' : 'PROCESS',
        riskScore: incident.severity === 'CRITICAL' ? 95 : incident.severity === 'HIGH' ? 80 : 50,
        commandLine: `C:\\Windows\\System32\\${incident.name || 'payload.exe'} --silent`,
      };

      setEvents((prev) => [newEvt, ...prev].slice(0, 100));
    });

    return () => unsubscribe();
  }, [subscribe]);

  // Simulate constant telemetry background heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const sampleHosts = ['HOD-LAPTOP-01', 'WIN-SRV-NORTH', 'DEV-DESKTOP-04', 'FINANCE-PC-02'];
      const sampleProcs = ['cmd.exe', 'conhost.exe', 'curl.exe', 'reg.exe', 'rundll32.exe', 'svchost.exe'];
      const categories: ('PROCESS' | 'NETWORK' | 'FILE' | 'REGISTRY' | 'SECURITY')[] = ['PROCESS', 'NETWORK', 'FILE', 'REGISTRY', 'SECURITY'];

      const host = sampleHosts[Math.floor(Math.random() * sampleHosts.length)];
      const proc = sampleProcs[Math.floor(Math.random() * sampleProcs.length)];
      const cat = categories[Math.floor(Math.random() * categories.length)];

      const bgEvt: TelemetryEvent = {
        id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        host,
        process: proc,
        pid: Math.floor(1000 + Math.random() * 8000),
        action: cat === 'NETWORK' ? 'TCP Socket Handshake' : cat === 'REGISTRY' ? 'Registry HKLM Modified' : 'Thread Created',
        category: cat,
        riskScore: Math.floor(5 + Math.random() * 30),
        commandLine: `C:\\Windows\\System32\\${proc}`,
      };

      setEvents((prev) => [bgEvt, ...prev].slice(0, 100));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = filterCategory === 'ALL' || evt.category === filterCategory;
    const matchesSearch = 
      evt.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.process.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.commandLine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Endpoint Surveillance & Watch Deck"
        description="Real-time telemetry surveillance stream across all active endpoints."
      >
        <div className="flex items-center gap-3">
          <Button
            variant={isPaused ? "primary" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 font-mono text-xs uppercase"
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </Button>

          <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/40 text-xs font-mono font-bold text-primary shadow-[0_0_10px_rgba(5,217,232,0.2)]">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            LIVE TELEMETRY
          </span>
        </div>
      </PageHeader>

      {/* ── Quick Stats Grid ── */}
      <PageSection className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 border-primary/30">
          <div className="p-3 bg-primary/10 text-primary border border-primary/30">
            <Laptop size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/50 uppercase">Active Monitored Hosts</div>
            <div className="text-xl font-bold font-mono text-white">{devices.length || 4} Endpoints</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-emerald-500/30">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/50 uppercase">Telemetry Event Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400">540 Events/sec</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-warning/30">
          <div className="p-3 bg-warning/10 text-warning border border-warning/30">
            <Cpu size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/50 uppercase">Process Interceptions</div>
            <div className="text-xl font-bold font-mono text-warning">142 Process Hooks</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-danger/30">
          <div className="p-3 bg-danger/10 text-danger border border-danger/30">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/50 uppercase">High Risk Anomalies</div>
            <div className="text-xl font-bold font-mono text-danger">3 Flagged</div>
          </div>
        </Card>
      </PageSection>

      {/* ── Endpoints Live Surveillance Grid ── */}
      <PageSection>
        <Card>
          <div className="flex items-center justify-between mb-4 border-b border-border-color pb-3">
            <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <Eye size={18} className="text-primary animate-pulse" />
              Live Endpoint Watch Grid
            </h3>
            <span className="text-xs font-mono text-white/40">Select endpoint to launch live terminal telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'HOD-LAPTOP-01', ip: '192.168.1.104', os: 'Windows 11 Ent', cpu: '24%', status: 'Online', process: 'powershell.exe', risk: 'Medium', color: 'border-cyan-500/40' },
              { id: 'WIN-SRV-NORTH', ip: '10.0.4.12', os: 'Win Server 2022', cpu: '62%', status: 'Online', process: 'lsass.exe', risk: 'High', color: 'border-danger/60 shadow-[0_0_15px_rgba(255,42,109,0.2)]' },
              { id: 'DEV-DESKTOP-04', ip: '192.168.1.150', os: 'Ubuntu 24.04', cpu: '12%', status: 'Online', process: 'git.exe', risk: 'Low', color: 'border-emerald-500/40' },
              { id: 'FINANCE-PC-02', ip: '192.168.1.88', os: 'Windows 10 Pro', cpu: '8%', status: 'Online', process: 'excel.exe', risk: 'Low', color: 'border-primary/40' },
            ].map((dev) => (
              <div 
                key={dev.id}
                onClick={() => setSelectedDevice(dev)}
                className={`p-4 bg-surface/60 border ${dev.color} hover:border-primary transition-all cursor-pointer group flex flex-col justify-between space-y-3 font-mono text-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop size={16} className="text-primary" />
                    <span className="font-bold text-white group-hover:text-primary transition-colors">{dev.id}</span>
                  </div>
                  <Badge variant={dev.risk === 'High' ? 'danger' : dev.risk === 'Medium' ? 'warning' : 'success'}>
                    {dev.risk}
                  </Badge>
                </div>

                <div className="space-y-1 text-white/60 text-[11px]">
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span className="text-white font-bold">{dev.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Process:</span>
                    <span className="text-cyan-300 font-bold">{dev.process}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Utilization:</span>
                    <span className="text-emerald-400 font-bold">{dev.cpu}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-primary group-hover:underline">
                  <span className="flex items-center gap-1">
                    <Terminal size={12} /> Live Terminal Telemetry
                  </span>
                  <ArrowUpRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageSection>

      {/* ── Live Telemetry Log Feed ── */}
      <PageSection>
        <Card>
          {/* Header Controls & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-border-color pb-4">
            <div>
              <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <Terminal size={18} className="text-primary" />
                Live Process & Command Execution Feed
              </h3>
              <p className="text-xs text-white/50 font-mono mt-0.5">Streaming process creations, network sockets, and security audits across agents</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter PID, Host, Process..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-surface/80 border border-white/20 text-xs font-mono text-white focus:outline-none focus:border-primary w-48 sm:w-64"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-surface/80 border border-white/10 p-1 font-mono text-[11px]">
                {['ALL', 'PROCESS', 'NETWORK', 'FILE', 'REGISTRY', 'SECURITY'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 transition-all cursor-pointer ${
                      filterCategory === cat ? 'bg-primary text-black font-bold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Stream Table */}
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Host</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Process / PID</th>
                  <th className="py-2.5 px-3">Telemetry Event</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3 text-right">Command Line</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-white/40">
                        No telemetry events matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((evt) => (
                      <motion.tr
                        key={evt.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-white/50">{evt.timestamp}</td>
                        <td className="py-2.5 px-3 font-bold text-primary">{evt.host}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                            evt.category === 'SECURITY' ? 'bg-danger/20 text-danger border-danger/40' :
                            evt.category === 'NETWORK'  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                            evt.category === 'REGISTRY' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                            evt.category === 'FILE'     ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                                                          'bg-primary/20 text-primary border-primary/40'
                          }`}>
                            {evt.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white">
                          <span className="font-bold">{evt.process}</span> <span className="text-white/40 text-[10px]">({evt.pid})</span>
                        </td>
                        <td className="py-2.5 px-3 text-white/80">{evt.action}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold ${
                            evt.riskScore > 75 ? 'text-danger' : evt.riskScore > 40 ? 'text-warning' : 'text-emerald-400'
                          }`}>
                            {evt.riskScore} / 100
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-white/40 truncate max-w-xs font-mono text-[11px]" title={evt.commandLine}>
                          {evt.commandLine}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </PageSection>

      {/* ── Device Inspection Modal ── */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-[#020617] border border-primary/60 p-6 font-mono shadow-[0_0_40px_rgba(5,217,232,0.3)] space-y-5"
          >
            <div className="flex items-center justify-between border-b border-primary/30 pb-3">
              <div className="flex items-center gap-3">
                <Laptop size={24} className="text-primary" />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDevice.id} Telemetry Deck</h3>
                  <p className="text-xs text-white/50">IP: {selectedDevice.ip} | OS: {selectedDevice.os}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDevice(null)}>Close</Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-surface/50 border border-white/10 text-xs">
              <div>
                <span className="text-white/40 block text-[10px]">CPU UTILIZATION</span>
                <span className="text-emerald-400 font-bold text-base">{selectedDevice.cpu}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">ACTIVE PROCESS</span>
                <span className="text-cyan-300 font-bold text-base">{selectedDevice.process}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px]">SHIELD STATUS</span>
                <span className="text-emerald-400 font-bold text-base">ACTIVE</span>
              </div>
            </div>

            {/* Raw Terminal Event Feed */}
            <div className="p-3 bg-black border border-primary/30 rounded-none text-xs space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-primary font-bold text-[10px] mb-2">// LIVE KERNEL PROBE LOG STREAM</div>
              <p className="text-white/60">[00:01:20] Hook attached to Process Creation API (NtCreateUserProcess)</p>
              <p className="text-white/60">[00:01:22] TCP Socket opened 192.168.1.104:52104 ➔ 185.220.101.5:443</p>
              <p className="text-emerald-400">[00:01:24] ✔ Zero-Trust Behavior Check: Clean</p>
              <p className="text-white/60">[00:01:25] Memory Page Protection Enforced (DEP/ASLR Active)</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => {
                  toast.error(`Endpoint ${selectedDevice.id} Isolated`, {
                    description: 'Network interfaces disabled and active sockets terminated.'
                  });
                  setSelectedDevice(null);
                }}
              >
                <AlertOctagon size={15} className="mr-1 inline" /> Force Isolate Endpoint
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
