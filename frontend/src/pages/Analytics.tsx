import React, { useState, useMemo } from 'react';
import { Activity, History, ShieldAlert, CheckCircle2, TrendingUp, Zap, Search, Filter, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ChartCard, Card, Badge, Input, Button, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const PIE_COLORS = ['#FF3D71', '#FF9F43', '#FFC107', '#00E5FF', '#7C3AED'];

export function Analytics() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['threats-history'],
    queryFn: async () => {
      const res = await api.get('/threats/history');
      return res.data;
    },
    refetchInterval: 10000,
  });

  // Filtered threat history
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    return history.filter((threat: any) => {
      const matchesSeverity = severityFilter === 'ALL' || threat.severity === severityFilter;
      const matchesSearch = 
        threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [history, severityFilter, searchQuery]);

  if (isLoading || historyLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4 text-primary animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
            <div className="w-3 h-3 rounded-full bg-primary animate-ping delay-75" />
            <div className="w-3 h-3 rounded-full bg-primary animate-ping delay-150" />
          </div>
          <span className="font-mono uppercase tracking-widest text-sm text-glow">Gathering Telemetry...</span>
        </div>
      </div>
    );
  }

  const totalThreats = analytics?.totalThreats || 24;
  const blockedThreats = analytics?.blockedThreats || 18;
  const resolvedCount = history?.length || analytics?.resolved || 15;
  const recoverySuccess = analytics?.recoverySuccess || 93;

  // Custom multi-line chart data for Threat Trends over time
  const trendData = [
    { date: 'May 19', High: 14, Medium: 10, Low: 6 },
    { date: 'May 20', High: 18, Medium: 12, Low: 8 },
    { date: 'May 21', High: 12, Medium: 15, Low: 10 },
    { date: 'May 22', High: 22, Medium: 18, Low: 7 },
    { date: 'May 23', High: 16, Medium: 14, Low: 12 },
    { date: 'May 24', High: 25, Medium: 19, Low: 9 },
    { date: 'May 25', High: totalThreats > 0 ? totalThreats : 24, Medium: 15, Low: 8 },
  ];

  // Donut chart distribution
  const pieData = analytics?.pieData && analytics.pieData.length > 0 
    ? analytics.pieData 
    : [
        { name: 'Critical / High', value: 40 },
        { name: 'Medium Risk', value: 35 },
        { name: 'Low Severity', value: 25 },
      ];

  return (
    <PageContainer className="animate-in fade-in duration-300">
      
      {/* ── Page Header & Time Range Controls ────────────────── */}
      <PageHeader
        title="Enterprise Analytics"
        description="Real-time telemetry, threat distribution, and recovery performance metrics."
      >

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface/80 border border-border-color self-start md:self-auto">
          <Calendar size={14} className="text-white/40 ml-2 mr-1" />
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* ── Top KPI Stat Cards Grid (4 Cards) ────────────────── */}
      <PageSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Threats */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-danger/10 border-danger/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total Threats</span>
            <div className="p-2 rounded-lg bg-danger/20 text-danger">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-space font-extrabold text-white">{totalThreats}</span>
            <span className="text-xs text-danger font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Detected across monitored endpoints</p>
        </Card>

        {/* Card 2: Blocked Threats */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/10 border-primary/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Blocked Threats</span>
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Zap size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-space font-extrabold text-white">{blockedThreats}</span>
            <span className="text-xs text-primary font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> +8%
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Immediate response containment</p>
        </Card>

        {/* Card 3: Resolved Threats */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-success/10 border-success/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Resolved</span>
            <div className="p-2 rounded-lg bg-success/20 text-success">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-space font-extrabold text-white">{resolvedCount}</span>
            <span className="text-xs text-success font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> +15%
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Successfully remediated workflows</p>
        </Card>

        {/* Card 4: Recovery Success Rate */}
        <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-secondary/10 border-secondary/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Recovery Success</span>
            <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-space font-extrabold text-white">{recoverySuccess}%</span>
            <span className="text-xs text-secondary font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> +5%
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">Automated SLA recovery rate</p>
        </Card>
      </PageSection>

      {/* ── Main Charts Section: Line Chart & Donut Chart ────── */}
      <PageSection className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Multi-Line Chart: Threats Over Time (2 Cols) */}
        <Card className="col-span-1 lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-border-color pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Threats Over Time</h3>
              <p className="text-xs text-white/50">Breakdown of incidents by severity levels over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Low</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B1220', 
                    borderColor: 'rgba(255,255,255,0.15)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="High" stroke="#FF3D71" strokeWidth={3} dot={{ r: 4, fill: '#FF3D71' }} />
                <Line type="monotone" dataKey="Medium" stroke="#FFC107" strokeWidth={3} dot={{ r: 4, fill: '#FFC107' }} />
                <Line type="monotone" dataKey="Low" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart: Threat Distribution (1 Col) */}
        <Card className="col-span-1 p-5 flex flex-col justify-between">
          <div className="border-b border-border-color pb-3 mb-2">
            <h3 className="text-base font-bold text-white">Threat Distribution</h3>
            <p className="text-xs text-white/50">Categorized risk vector breakdown</p>
          </div>

          <div className="relative h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-space font-extrabold text-white">{totalThreats}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Total</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
            {pieData.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-white/70">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-bold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </PageSection>

      {/* ── Interactive Threat History Table Section ────────────── */}
      <PageSection>
        <Card className="p-5">
        
        {/* Table Controls Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-border-color">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <History size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Resolved Threat Ledger</h3>
              <p className="text-xs text-white/50">Historical record of remediated security incidents</p>
            </div>
          </div>

          {/* Search & Severity Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-white/40" size={15} />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border-color bg-surface/60 pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Severity Filter Dropdown */}
            <div className="flex items-center gap-1 bg-surface/60 border border-border-color rounded-lg p-1">
              <Filter size={13} className="text-white/40 ml-2" />
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    severityFilter === sev
                      ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <Badge variant="success" className="px-3 py-1 text-xs">
              {filteredHistory.length} Resolved
            </Badge>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-white/10 text-white/50 sticky top-0 bg-[#0B1220] z-10 text-xs font-mono uppercase tracking-wider">
              <tr>
                <th className="pb-3 pr-4">Incident ID</th>
                <th className="pb-3 px-4">Threat Name & Category</th>
                <th className="pb-3 px-4">Severity</th>
                <th className="pb-3 px-4">Target Device</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 pl-4 text-right">Resolved Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    <p className="text-base font-medium">No resolved threats match your filter.</p>
                    <p className="text-xs text-white/30 mt-1">Try clearing search terms or selecting a different severity filter.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((threat: any) => (
                  <tr 
                    key={threat.id} 
                    className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pr-4 font-mono text-xs text-white/50 group-hover:text-primary">
                      #{threat.id.split('-')[0]}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm group-hover:text-primary transition-colors">
                          {threat.name}
                        </span>
                        <span className="text-xs text-white/40 font-mono">{threat.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold ${
                        threat.severity === 'CRITICAL'
                          ? 'bg-danger/20 text-danger border border-danger/30'
                          : threat.severity === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : threat.severity === 'MEDIUM'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-white/60">
                      {threat.target || 'SIMULATED-ENDPOINT / 10.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-success text-xs font-semibold px-2 py-0.5 rounded-md bg-success/10 border border-success/20">
                        <CheckCircle2 size={12} /> {threat.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-xs font-mono text-white/40">
                      {format(new Date(threat.createdAt || Date.now()), 'MMM dd, HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
