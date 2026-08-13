import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, CheckCircle, Circle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge, PageContainer, PageHeader, PageSection } from '@/components/ui';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

const SEVERITY_RANK: Record<string, number> = {
  'CRITICAL': 4,
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1,
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-danger/20 text-danger border border-danger/30',
  HIGH: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
  LOW: 'bg-primary/20 text-primary border border-primary/30',
};

function sortBySeverity(arr: any[]) {
  return [...arr].sort(
    (a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0)
  );
}

export function Recovery() {
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  // Response mode: AUTOMATED or MANUAL (from Settings)
  const [responseMode] = useState<'AUTOMATED' | 'MANUAL'>(
    () => (localStorage.getItem('astra_response_mode') as 'AUTOMATED' | 'MANUAL') || 'AUTOMATED'
  );
  const isManual = responseMode === 'MANUAL';

  // All active threats in queue (sorted by severity desc)
  const [queue, setQueue] = useState<any[]>([]);
  // The one currently being resolved (top of queue)
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(2);
  const [isResolving, setIsResolving] = useState(false);
  const [stepsError, setStepsError] = useState(false);

  // Use ref to avoid stale closure inside WS callback
  const activeIncidentRef = useRef<any>(null);
  activeIncidentRef.current = activeIncident;

  // ── Fetch active threats from server ──────────────────────────────────────
  const { data: fetchedThreats, isLoading } = useQuery({
    queryKey: ['threats'],
    queryFn: async () => {
      const res = await api.get('/threats');
      return res.data as any[];
    },
    refetchInterval: 10000,
  });

  // Sync server data into queue; only set active if nothing is active yet
  useEffect(() => {
    if (!fetchedThreats) return;
    const sorted = sortBySeverity(fetchedThreats);
    setQueue(sorted);
    if (!activeIncidentRef.current && sorted.length > 0) {
      setActiveIncident(sorted[0]);
      setCurrentStep(2);
    }
    if (sorted.length === 0) {
      setActiveIncident(null);
      setSteps([]);
      setCurrentStep(2);
    }
  }, [fetchedThreats]);

  // ── WebSocket: new incident arrives ───────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe('timeline', (payload: any) => {
      if (payload.event !== 'NEW_INCIDENT') return;
      const newIncident = payload.incident;

      setQueue(prev => {
        // Avoid duplicates
        const exists = prev.some((t: any) => t.id === newIncident.id);
        const updated = sortBySeverity(exists ? prev : [...prev, newIncident]);

        // Preempt active incident only if new one outranks it
        const current = activeIncidentRef.current;
        if (!current || (SEVERITY_RANK[newIncident.severity] || 0) > (SEVERITY_RANK[current.severity] || 0)) {
          setActiveIncident(newIncident);
          setCurrentStep(2);
        }

        return updated;
      });
    });
    return () => unsubscribe();
  }, [subscribe]);

  // ── Fetch recovery steps whenever active incident changes ─────────────────
  const fetchSteps = useCallback(async (incidentId: string) => {
    setStepsError(false);
    try {
      const res = await api.get(`/recovery/${incidentId}`);
      setSteps(res.data);
      setCurrentStep(2);
    } catch (err) {
      console.error('Failed to fetch recovery steps', err);
      setStepsError(true);
      setSteps([]);
    }
  }, []);

  useEffect(() => {
    if (activeIncident?.id) {
      fetchSteps(activeIncident.id);
    } else {
      setSteps([]);
      setStepsError(false);
    }
  }, [activeIncident?.id, fetchSteps]);

  // ── Auto-advance steps (only in AUTOMATED mode) ───────────────────────
  useEffect(() => {
    if (isManual) return;                              // ← skip in manual mode
    if (!activeIncident || steps.length === 0 || isResolving) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev <= steps.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          handleResolve();
          return prev;
        }
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [activeIncident?.id, steps.length, isResolving, isManual]);

  // ── Manual: advance one step at a time ────────────────────────────────
  const handleNextStep = () => {
    if (currentStep <= steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // ── Resolve current threat, advance to next ───────────────────────────────
  const handleResolve = async () => {
    if (!activeIncident) return;
    setIsResolving(true);
    try {
      await api.put(`/threats/${activeIncident.id}/resolve`);
      toast.success(`Threat "${activeIncident.name}" resolved`);

      setQueue(prev => {
        const remaining = prev.filter((t: any) => t.id !== activeIncident.id);
        if (remaining.length > 0) {
          setActiveIncident(remaining[0]);
          setCurrentStep(2);
        } else {
          setActiveIncident(null);
          setSteps([]);
          setCurrentStep(2);
        }
        return remaining;
      });

      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['threats-history'] });
    } catch (err) {
      console.error('Failed to resolve threat', err);
      toast.error('Failed to resolve threat');
    } finally {
      setIsResolving(false);
    }
  };

  // ── Derived: all recovery steps except step 0 (immediate action) ──────────
  const immediateActionStep = steps[0] ?? null;
  const wizardSteps = steps.slice(1);
  const allWizardDone = wizardSteps.length > 0 && currentStep > steps.length;
  const noThreats = queue.length === 0 && !isLoading;

  return (
    <PageContainer>
      <PageHeader
        title="System Recovery"
        description="Automated incident response and recovery wizard."
      >
        {activeIncident && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-danger/30 bg-danger/5 cyber-cut">
            <AlertTriangle className="text-danger" size={16} />
            <span className="text-sm text-white/80 font-mono">
              Resolving: <strong className="text-white">{activeIncident.name}</strong>
            </span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold cyber-cut ${SEVERITY_COLORS[activeIncident.severity] || SEVERITY_COLORS.LOW}`}>
              {activeIncident.severity}
            </span>
          </div>
        )}
      </PageHeader>

      {noThreats && (
        <PageSection>
          <Card className="p-8 flex flex-col items-center justify-center gap-3 border-success/30 bg-success/5 cyber-cut">
            <CheckCircle className="text-success" size={40} />
            <h3 className="text-xl font-mono font-bold text-white tracking-widest uppercase">All Clear</h3>
            <p className="text-white/60 text-sm text-center font-mono">No active threats require recovery. The system is secure.</p>
          </Card>
        </PageSection>
      )}

      <PageSection className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Column 1: Threats Queue ─────────────────── */}
        <Card className="col-span-1 flex flex-col" style={{ maxHeight: '700px' }}>
          <h3 className="mb-4 text-lg font-medium text-white flex items-center justify-between">
            Threats in Queue
            <Badge variant={queue.length > 0 ? 'danger' : 'default'}>{queue.length}</Badge>
          </h3>
          <p className="text-xs text-white/30 mb-3 italic">Threats are auto-resolved by severity. Highest priority first.</p>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {queue.length === 0 ? (
              <p className="text-white/50 text-sm">No active threats.</p>
            ) : (
              queue.map((threat: any, idx: number) => {
                const isSelected = threat.id === activeIncident?.id;
                return (
                  <div
                    key={threat.id}
                    onClick={() => {
                      setActiveIncident(threat);
                      setCurrentStep(2);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                        : 'border-border-color bg-surface/50 hover:border-accent/40 hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-white/30 font-mono shrink-0">#{idx + 1}</span>
                        <span className="font-medium text-white text-sm truncate">{threat.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold shrink-0 ${SEVERITY_COLORS[threat.severity] || SEVERITY_COLORS.LOW}`}>
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-1 ml-5 truncate">{threat.type}</p>
                    {isSelected && (
                      <div className="text-xs text-accent mt-2 flex items-center gap-1 animate-pulse ml-5">
                        <RotateCcw size={11} /> Active in Wizard
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* ── Column 2: Recovery Wizard ───────────────── */}
        <Card className="col-span-1 lg:col-span-1 flex flex-col">
          <h3 className="mb-4 text-lg font-medium text-white truncate">
            {activeIncident ? `Wizard — ${activeIncident.name}` : 'Recovery Wizard'}
          </h3>

          <div className="flex-1 space-y-4">
            {stepsError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-start gap-2">
                <AlertTriangle className="text-danger shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-danger/90">
                  Failed to load recovery steps. The database schema may not be migrated yet.
                  Please restart the backend to apply the V4 migration.
                </p>
              </div>
            )}

            {!activeIncident && !stepsError && (
              <p className="text-white/50 text-sm">No active incident selected.</p>
            )}

            {/* Immediate Action Block */}
            {immediateActionStep && (
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 flex items-start gap-3 shadow-[0_0_20px_rgba(255,0,0,0.08)]">
                <ShieldAlert className="shrink-0 mt-0.5 text-danger" size={22} />
                <div>
                  <h4 className="font-bold text-xs text-danger mb-1 tracking-widest uppercase">
                    ⚡ Immediate Action Executed
                  </h4>
                  <p className="text-danger/90 text-sm font-medium leading-snug">
                    {immediateActionStep.title.replace('[Immediate Action] ', '')}
                  </p>
                </div>
              </div>
            )}

            {/* Wizard Steps */}
            {wizardSteps.length > 0 && (
              <div className="space-y-5 mt-2">
                {wizardSteps.map((step: any, index: number) => {
                  const stepId = index + 2;
                  const done = stepId < currentStep;
                  const active = stepId === currentStep;
                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {index !== wizardSteps.length - 1 && (
                        <div
                          className={`absolute left-3 top-7 h-full w-px -translate-x-1/2 ${done ? 'bg-primary' : 'bg-white/10'}`}
                        />
                      )}
                      <div
                        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full z-10 ${
                          done
                            ? 'bg-primary/20 text-primary'
                            : active
                            ? 'bg-surface text-accent border border-accent ring-4 ring-accent/20'
                            : 'bg-surface text-white/30 border border-white/10'
                        }`}
                      >
                        {done ? <CheckCircle size={16} /> : <Circle size={10} fill="currentColor" />}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-sm font-medium leading-snug ${!done && !active ? 'text-white/50' : 'text-white'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {done ? '✓ Done' : active ? '● In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-border-color">
            {isResolving ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm font-mono text-accent animate-pulse">
                <RotateCcw size={14} className="animate-spin" />
                Resolving threat...
              </div>
            ) : isManual ? (
              // ── Manual mode controls ──────────────────────────────────
              <div className="flex flex-col gap-2">
                {!allWizardDone && steps.length > 0 && (
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep > steps.length}
                    className="w-full py-2 rounded-lg bg-accent/10 border border-accent/40 text-accent text-sm font-mono font-semibold hover:bg-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▶ Next Step ({currentStep - 1} / {steps.length - 1})
                  </button>
                )}
                {allWizardDone && (
                  <button
                    onClick={handleResolve}
                    className="w-full py-2 rounded-lg bg-success/10 border border-success/40 text-success text-sm font-mono font-semibold hover:bg-success/20 transition-all"
                  >
                    <CheckCircle size={14} className="inline mr-1" />
                    Mark as Resolved
                  </button>
                )}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-yellow-500/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  MANUAL CONFIRMATION MODE
                </div>
              </div>
            ) : allWizardDone ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm font-mono text-success">
                <CheckCircle size={14} />
                Finalizing — threat will be marked resolved
              </div>
            ) : steps.length > 0 ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm font-mono text-accent">
                <RotateCcw size={14} className="animate-spin" />
                Auto-advancing recovery steps...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-sm font-mono text-white/30">
                Waiting for recovery steps...
              </div>
            )}
            {!isManual && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-success/70">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                AUTONOMOUS RECOVERY ACTIVE
              </div>
            )}
          </div>
        </Card>

        {/* ── Column 3–4: Recovery Logs ───────────────── */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Recovery Logs</h3>
            <Badge variant={allWizardDone ? 'success' : steps.length > 0 ? 'warning' : 'default'}>
              {allWizardDone ? 'Completed' : steps.length > 0 ? 'In Progress' : 'Standby'}
            </Badge>
          </div>
          <div className="flex-1 rounded-lg bg-[#05070B] p-4 font-mono text-xs overflow-y-auto min-h-[350px] space-y-1.5">
            {activeIncident ? (
              <>
                <p className="text-white/40">[{new Date(activeIncident.createdAt || Date.now()).toLocaleTimeString()}] Incident "<span className="text-white/70">{activeIncident.name}</span>" detected. Severity: <span className={activeIncident.severity === 'CRITICAL' ? 'text-danger' : activeIncident.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}>{activeIncident.severity}</span></p>
                <p className="text-white/40">[{new Date().toLocaleTimeString()}] Initiating automated recovery sequence...</p>
                {immediateActionStep && (
                  <p className="text-danger">[{new Date().toLocaleTimeString()}] ⚡ IMMEDIATE ACTION: {immediateActionStep.title.replace('[Immediate Action] ', '')}</p>
                )}
                {steps.slice(0, currentStep - 1).map((step: any, idx: number) =>
                  idx === 0 ? null : (
                    <p key={idx} className="text-green-400">
                      [{new Date().toLocaleTimeString()}] ✓ Completed Step {idx}: {step.title}
                    </p>
                  )
                )}
                {!allWizardDone && currentStep <= steps.length && (
                  <p className="text-accent animate-pulse">[{new Date().toLocaleTimeString()}] ● Processing step {currentStep - 1}...</p>
                )}
                {allWizardDone && (
                  <p className="text-primary">[{new Date().toLocaleTimeString()}] ✓ All recovery steps completed. Ready to finalize.</p>
                )}
              </>
            ) : (
              <p className="text-white/30">Waiting for incident data... System is monitoring.</p>
            )}
          </div>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
