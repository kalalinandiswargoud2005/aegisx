import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ShieldAlert, Server, Activity, 
  Cpu, HardDrive, Network 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { StatCard, Card, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const initialActivityData = [
  { time: '00:00', threats: 12, blocked: 12 },
  { time: '04:00', threats: 19, blocked: 18 },
  { time: '08:00', threats: 43, blocked: 42 },
  { time: '12:00', threats: 85, blocked: 85 },
  { time: '16:00', threats: 65, blocked: 62 },
  { time: '20:00', threats: 34, blocked: 34 },
  { time: '24:00', threats: 14, blocked: 14 },
];

export function Dashboard() {
  const { subscribe, isConnected } = useWebSocket();
  const [activityData, setActivityData] = useState(initialActivityData);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    }
  });

  const { data: initialThreats } = useQuery({
    queryKey: ['active-threats'],
    queryFn: async () => {
      const res = await api.get('/threats');
      return res.data;
    }
  });

  useEffect(() => {
    if (initialThreats && recentAlerts.length === 0) {
      setRecentAlerts(initialThreats.slice(0, 10).map((t: any) => ({
        id: t.id,
        type: t.type,
        severity: t.severity,
        source: t.target,
        time: new Date(t.createdAt).toLocaleTimeString()
      })));
    }
  }, [initialThreats]);
  
  useEffect(() => {
    const unsubscribeThreats = subscribe('threats', (incident) => {
      setRecentAlerts(prev => [
        {
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          source: incident.target,
          time: 'Just now'
        },
        ...prev
      ].slice(0, 10)); // Keep last 10
      
      toast.error(`New Threat Detected: ${incident.type}`, {
        description: `Severity: ${incident.severity} | Target: ${incident.target}`,
      });
    });

    return () => {
      unsubscribeThreats();
    };
  }, [subscribe]);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      <motion.div variants={itemVariants} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-white flex items-center gap-2 uppercase tracking-widest text-glow">
            System Overview <span className="animate-pulse text-primary">_</span>
          </h1>
          <p className="text-white/60 font-mono text-sm tracking-wider uppercase mt-1">Real-time threat monitoring and system health.</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="success" className="px-3 py-1 text-sm shadow-[0_0_10px_rgba(0,230,118,0.3)]">
              <span className="mr-2 h-2 w-2 rounded-none cyber-cut bg-success animate-pulse inline-block" />
              System Secure (Live)
            </Badge>
          ) : (
            <Badge variant="danger" className="px-3 py-1 text-sm shadow-[0_0_10px_rgba(255,42,109,0.3)]">
              <span className="mr-2 h-2 w-2 rounded-none cyber-cut bg-danger inline-block" />
              Disconnected
            </Badge>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Threats" 
          value={metrics?.activeThreats?.toString() || "0"} 
          icon={<ShieldAlert />} 
          trend={{ value: 12, label: 'vs last 24h', isPositive: false }} 
        />
        <StatCard 
          title="Protected Devices" 
          value={metrics?.connectedDevices?.toString() || "0"} 
          icon={<Server />} 
          trend={{ value: 4, label: 'vs last 24h', isPositive: true }} 
        />
        <StatCard 
          title="System Health" 
          value={metrics?.systemHealth ? `${metrics.systemHealth}%` : "100%"} 
          icon={<Activity />} 
          trend={{ value: 0.1, label: 'vs last 24h', isPositive: true }} 
        />
        <StatCard 
          title="Network Traffic" 
          value="45.2 TB" 
          icon={<Network />} 
          trend={{ value: 8, label: 'vs last 24h', isPositive: true }} 
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col group relative overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(5,217,232,0.1)] p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center gap-2">
                <span className="text-primary animate-pulse">{'>'}</span> Threat Activity Spectrum (24h)
              </h3>
              <p className="text-xs text-white/50 font-mono mt-0.5">Real-time incident detection vs. autonomous mitigation rate</p>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/40 text-xs font-bold text-primary shadow-[0_0_10px_rgba(5,217,232,0.2)]">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                99.8% PROTECTION RATE
              </span>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-surface/40 border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-danger" />
              <div>
                <div className="text-[10px] text-white/40 uppercase">Total Threats</div>
                <div className="text-sm font-bold text-danger">272 Incidents</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-primary" />
              <div>
                <div className="text-[10px] text-white/40 uppercase">Auto-Mitigated</div>
                <div className="text-sm font-bold text-primary">271 (99.8%)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-emerald-400" />
              <div>
                <div className="text-[10px] text-white/40 uppercase">Avg Response</div>
                <div className="text-sm font-bold text-emerald-400">&lt; 3.2 ms</div>
              </div>
            </div>
          </div>

          {/* High-Tech Glowing Area Chart Graph */}
          <div className="flex-1 min-h-[260px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(5,217,232,0.15)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <RechartsTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#020617] border border-primary/50 p-3 shadow-[0_0_20px_rgba(5,217,232,0.4)] font-mono text-xs">
                          <div className="text-primary font-bold mb-1 border-b border-primary/20 pb-1">TIME: {label}</div>
                          <div className="text-danger flex items-center justify-between gap-4">
                            <span>Detected Threats:</span>
                            <span className="font-bold">{payload[0]?.value}</span>
                          </div>
                          <div className="text-primary flex items-center justify-between gap-4">
                            <span>Auto-Blocked:</span>
                            <span className="font-bold">{payload[1]?.value}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="threats" stroke="var(--color-danger)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThreats)" activeDot={{ r: 6, fill: "var(--color-danger)", stroke: "#fff" }} />
                <Area type="monotone" dataKey="blocked" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlocked)" activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
          <h3 className="mb-4 text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center">
            <span className="text-primary mr-2 animate-pulse">{'>'}</span> System Health
          </h3>
          <div className="space-y-8 flex-1 relative z-10 mt-2">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2 text-white/70"><Cpu size={16} className="text-primary"/> CPU Usage</span>
                <span className="font-bold text-white text-glow">42%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-none bg-white/10 cyber-cut">
                <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-primary shadow-[0_0_10px_rgba(5,217,232,0.8)]" />
              </div>
            </div>
            
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2 text-white/70"><Server size={16} className="text-warning"/> Memory</span>
                <span className="font-bold text-white text-glow">68%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-none bg-white/10 cyber-cut">
                <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1, delay: 0.7 }} className="h-full bg-warning shadow-[0_0_10px_rgba(243,230,0,0.8)]" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2 text-white/70"><HardDrive size={16} className="text-danger"/> Storage</span>
                <span className="font-bold text-white text-glow">89%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-none bg-white/10 cyber-cut">
                <motion.div initial={{ width: 0 }} animate={{ width: '89%' }} transition={{ duration: 1, delay: 0.9 }} className="h-full bg-danger shadow-[0_0_10px_rgba(255,42,109,0.8)]" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-mono font-bold tracking-widest uppercase text-white flex items-center">
              <span className="text-primary mr-2 animate-pulse">{'>'}</span> Recent Alerts
            </h3>
            <button className="text-xs font-mono uppercase tracking-widest text-primary hover:text-white hover:underline transition-colors">View All</button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono uppercase tracking-widest">Alert ID</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">Type</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">Severity</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">Source</TableHead>
                <TableHead className="text-right font-mono uppercase tracking-widest">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {recentAlerts.map((alert) => (
                  <motion.tr 
                    key={alert.id}
                    initial={{ opacity: 0, y: -20, backgroundColor: "rgba(255,42,109,0.3)" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-border-color transition-colors hover:bg-white/5"
                  >
                    <TableCell className="font-mono font-medium text-white/90">{alert.id}</TableCell>
                    <TableCell className="font-rajdhani font-bold tracking-wide">{alert.type}</TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.severity === 'Critical' ? 'danger' :
                        alert.severity === 'High' ? 'warning' :
                        alert.severity === 'Medium' ? 'info' : 'default'
                      }>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/70 font-mono text-xs">{alert.source}</TableCell>
                    <TableCell className="text-right text-primary/70 font-mono text-xs">{alert.time}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </motion.div>
  );
}
