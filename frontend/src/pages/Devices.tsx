import React from 'react';
import { Laptop, Server, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDeviceIcon = (type: string) => {
  if (type === 'Server') return <Server size={18} className="text-primary" />;
  if (type === 'Laptop' || type === 'Desktop') return <Laptop size={18} className="text-secondary" />;
  return <Smartphone size={18} className="text-white/50" />;
};

export function Devices() {
  const { data: devices = [], isLoading, isError } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    }
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Connected Devices"
        description="Monitor endpoints and agent statuses."
      >
        <Button variant="primary">Add Device</Button>
      </PageHeader>

      <PageSection>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono uppercase tracking-widest">Device</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">OS</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">IP Address</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">Agent</TableHead>
                <TableHead className="font-mono uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right font-mono uppercase tracking-widest">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4 text-primary animate-pulse">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-75" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-150" />
                        </div>
                        <span className="font-mono uppercase tracking-widest text-sm text-glow">Scanning Endpoints...</span>
                      </div>
                    </TableCell>
                  </motion.tr>
                ) : isError ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TableCell colSpan={6} className="text-center py-8 text-danger font-mono uppercase tracking-widest bg-danger/5">
                      Failed to fetch device registry.
                    </TableCell>
                  </motion.tr>
                ) : devices.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <TableCell colSpan={6} className="text-center py-8 text-white/50 font-mono">
                      No devices connected.
                    </TableCell>
                  </motion.tr>
                ) : (
                  devices.map((device: any) => (
                    <motion.tr 
                      key={device.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-border-color transition-colors hover:bg-white/5"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-none cyber-cut bg-surface border border-border-color group-hover:border-primary/50 transition-colors">
                            {getDeviceIcon(device.type)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-rajdhani font-bold text-white tracking-wide">{device.name}</span>
                            <span className="text-xs text-white/50 font-mono">{device.type}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70 font-mono text-sm">{device.os || 'Unknown'}</TableCell>
                      <TableCell className="text-white/70 font-mono text-sm">{device.ipAddress || device.ip}</TableCell>
                      <TableCell className="text-white/70 font-mono text-sm">{device.agentVersion || 'v1.0.0'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
                          {device.status === 'Online' ? (
                            <CheckCircle size={14} className="text-success" />
                          ) : (
                            <XCircle size={14} className="text-white/30" />
                          )}
                          <span className={device.status === 'Online' ? 'text-success' : 'text-white/50'}>
                            {device.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          device.health === 'Healthy' ? 'success' :
                          device.health === 'Warning' ? 'warning' : 'danger'
                        }>
                          {device.health}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
