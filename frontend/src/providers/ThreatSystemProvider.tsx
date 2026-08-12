/**
 * ThreatSystemProvider.tsx
 *
 * Global provider that:
 *  1. Subscribes to WebSocket threats on every page
 *  2. Shows the full-screen RED → GREEN popup on any new threat
 *  3. Auto-runs background recovery (calls PUT /threats/:id/resolve)
 *  4. Shows a small "Threat Resolved" toast when recovery completes
 *
 * Mount this once inside App.tsx so it works regardless of which page the
 * user is on — they do NOT need to visit the Recovery page.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '@/providers/WebSocketProvider';
import {
  ThreatAlertModal,
  ResolvedToastContainer,
  type ThreatAlertPayload,
  type ResolvedToastPayload,
} from '@/features/assistant/components/ThreatAlertModal';
import { AudioAlertService, type AlertSeverity } from '@/services/AudioAlertService';
import api from '@/lib/api';

// ── Context (optional — lets any component read threat state) ─────────────────

interface ThreatSystemContextType {
  activeThreatCount: number;
}

const ThreatSystemContext = createContext<ThreatSystemContextType>({
  activeThreatCount: 0,
});

export const useThreatSystem = () => useContext(ThreatSystemContext);

// ── Recovery helpers ──────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
};

/** Fetch recovery steps for an incident */
async function fetchRecoverySteps(incidentId: string): Promise<any[]> {
  try {
    const res = await api.get(`/recovery/${incidentId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** Mark threat as resolved on backend */
async function resolveOnBackend(incidentId: string): Promise<boolean> {
  try {
    await api.put(`/threats/${incidentId}/resolve`);
    return true;
  } catch {
    return false;
  }
}

// ── STEP_DELAY — time between auto-recovery steps ─────────────────────────────
const STEP_DELAY_MS = 2500;

// ── Provider ──────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

export function ThreatSystemProvider({ children }: Props) {
  const { subscribe } = useWebSocket();
  const navigate = useNavigate();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [activeThreat, setActiveThreat] = useState<ThreatAlertPayload | null>(null);

  // ── Resolved toasts ──────────────────────────────────────────────────────
  const [resolvedToasts, setResolvedToasts] = useState<ResolvedToastPayload[]>([]);

  // ── Dedup: don't show popup or re-resolve the same incident twice ────────
  const seenIdsRef        = useRef<Set<string>>(new Set());
  const resolvedIdsRef    = useRef<Set<string>>(new Set());

  // ── Count (for context) ──────────────────────────────────────────────────
  const [activeThreatCount, setActiveThreatCount] = useState(0);

  // ── Toast close handler ──────────────────────────────────────────────────
  const closeToast = useCallback((id: string) => {
    setResolvedToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── WebSocket: new threat ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe('threats', (incident: any) => {
      const id = String(incident.id || Date.now());

      // Dedup: ignore if already seen
      if (seenIdsRef.current.has(id)) return;
      seenIdsRef.current.add(id);

      // Keep set bounded
      if (seenIdsRef.current.size > 200) {
        const first = seenIdsRef.current.values().next().value;
        if (first !== undefined) seenIdsRef.current.delete(first);
      }

      setActiveThreatCount((prev) => prev + 1);

      // Build payload for modal
      const payload: ThreatAlertPayload = {
        id,
        severity:  incident.severity  || 'LOW',
        type:      incident.type      || 'Unknown',
        target:    incident.target    || 'Unknown',
        name:      incident.name      || incident.type || 'Unknown',
        timestamp: new Date().toLocaleTimeString('en-US'),
      };

      // Show modal (replaces any current one — latest threat wins)
      setActiveThreat(payload);

      // Unlock AudioContext (browser autoplay policy) then play the alert tone
      const severityKey = (payload.severity.toUpperCase() as AlertSeverity);
      AudioAlertService.unlockAudioContext()
        .then(() => {
          AudioAlertService.playThreatAlert(
            ['CRITICAL','HIGH','MEDIUM','LOW'].includes(severityKey)
              ? severityKey
              : 'LOW'
          );
        })
        .catch(() => { /* audio unavailable */ });
    });

    return () => unsubscribe();
  }, [subscribe]);

  // ── WebSocket: timeline (resolved externally, e.g. from Recovery page) ────
  useEffect(() => {
    const unsubscribe = subscribe('timeline', (payload: any) => {
      if (payload.event === 'RESOLVED' || payload.event === 'THREAT_RESOLVED') {
        const id = String(payload.incidentId || payload.incident?.id || '');
        if (!id) return;
        if (resolvedIdsRef.current.has(id)) return;
        resolvedIdsRef.current.add(id);

        const name =
          payload.incident?.name ||
          payload.incident?.type ||
          'Threat';

        setResolvedToasts((prev) => [
          ...prev,
          { id: `${id}-ext-${Date.now()}`, name },
        ]);
        setActiveThreatCount((prev) => Math.max(0, prev - 1));
        try { AudioAlertService.playSuccessSound(); } catch { /* */ }
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  return (
    <ThreatSystemContext.Provider value={{ activeThreatCount }}>
      {children}

      {/* ── Full-screen threat modal ── */}
      <ThreatAlertModal
        threat={activeThreat}
        onDismiss={() => {
          setActiveThreat(null);
          navigate('/recovery');
        }}
      />

      {/* ── Small resolved toasts (bottom-right) ── */}
      <ResolvedToastContainer
        items={resolvedToasts}
        onClose={closeToast}
      />
    </ThreatSystemContext.Provider>
  );
}
