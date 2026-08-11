/**
 * useAudioAlerts.ts
 *
 * React hook that wraps AudioAlertService and manages:
 *
 * - Audio / voice enabled state (persisted to localStorage)
 * - Volume persistence
 * - Incident dedup via a Set of recently-alerted IDs
 * - Priority queue so higher-severity tones play first
 * - Minimum interval between tones (anti-spam)
 * - TTS cooldown so voice alerts do not overlap
 *
 * The hook accepts a MutableRefObject<speakText> so it can be instantiated
 * before speakText is defined in the component body (avoids forward-reference
 * TypeScript errors) while always calling the latest version at runtime.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MutableRefObject,
} from 'react';
import { AudioAlertService, AlertSeverity } from '@/services/AudioAlertService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThreatIncident {
  id: string;
  severity: string;
}

interface QueuedAlert {
  severity: AlertSeverity;
  priority: number;
  incidentId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const VOICE_MESSAGES: Record<AlertSeverity, string> = {
  CRITICAL: 'Critical security threat detected.',
  HIGH: 'High severity threat detected.',
  MEDIUM: 'Security event detected.',
  LOW: 'Security notification.',
};

const VALID_SEVERITIES = new Set<AlertSeverity>(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

const MIN_ALERT_INTERVAL_MS = 1500;  // minimum gap between tone plays
const VOICE_COOLDOWN_MS = 3000;      // minimum gap between TTS phrases
const MAX_ALERTED_IDS = 200;         // cap on memory used by dedup Set

// ── localStorage helpers ──────────────────────────────────────────────────────

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
}

function readNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param speakTextRef - A ref to the existing speakText function from AssistantPage.
 *                       Using a ref avoids forward-reference issues when the hook is
 *                       called before speakText is defined in the component body while
 *                       still invoking the latest closure at runtime.
 */
export function useAudioAlerts(
  speakTextRef: MutableRefObject<(text: string) => void>
) {
  // ── Persisted settings ────────────────────────────────────────────────────

  const [audioEnabled, setAudioEnabledState] = useState<boolean>(() =>
    readBool('aegisx_audio_alerts', true)
  );

  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() =>
    readBool('aegisx_voice_alerts', false)
  );

  const [volume, setVolumeState] = useState<number>(() =>
    readNumber('aegisx_alert_volume', 0.7)
  );

  const [audioAvailable] = useState<boolean>(() => AudioAlertService.isAvailable());

  // ── Refs for queue / dedup / timing ──────────────────────────────────────

  const alertedIdsRef = useRef<Set<string>>(new Set());
  const alertedIdsOrderRef = useRef<string[]>([]); // FIFO for max-size eviction

  const queueRef = useRef<QueuedAlert[]>([]);
  const isProcessingRef = useRef(false);
  const lastAlertTimeRef = useRef(0);
  const lastVoiceTimeRef = useRef(0);

  // audioEnabled / voiceEnabled inside the processQueue callback need a ref
  // to avoid stale closures when scheduling setTimeout callbacks.
  const audioEnabledRef = useRef(audioEnabled);
  const voiceEnabledRef = useRef(voiceEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  // ── Sync volume to service on mount and on change ────────────────────────

  useEffect(() => {
    AudioAlertService.setAlertVolume(volume);
  }, [volume]);

  // ── Persist settings to localStorage ─────────────────────────────────────

  const setAudioEnabled = useCallback((value: boolean) => {
    setAudioEnabledState(value);
    try { localStorage.setItem('aegisx_audio_alerts', String(value)); } catch { /* */ }
  }, []);

  const setVoiceEnabled = useCallback((value: boolean) => {
    setVoiceEnabledState(value);
    try { localStorage.setItem('aegisx_voice_alerts', String(value)); } catch { /* */ }
    // Unlocking AudioContext on voice-enable counts as a user gesture
    if (value) {
      AudioAlertService.unlockAudioContext().catch(() => { /* */ });
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setVolumeState(clamped);
    AudioAlertService.setAlertVolume(clamped);
    try { localStorage.setItem('aegisx_alert_volume', String(clamped)); } catch { /* */ }
  }, []);

  // ── Queue processor ───────────────────────────────────────────────────────

  // Stable ref so processQueue can call itself recursively via setTimeout
  // without stale closures.
  const processQueueRef = useRef<() => void>(() => { /* */ });

  processQueueRef.current = () => {
    if (isProcessingRef.current) return;
    if (queueRef.current.length === 0) return;

    const now = Date.now();
    const elapsed = now - lastAlertTimeRef.current;

    if (elapsed < MIN_ALERT_INTERVAL_MS) {
      const delay = MIN_ALERT_INTERVAL_MS - elapsed;
      isProcessingRef.current = true;
      setTimeout(() => {
        isProcessingRef.current = false;
        processQueueRef.current();
      }, delay);
      return;
    }

    isProcessingRef.current = true;

    // Sort by priority descending, then pick the first
    queueRef.current.sort((a, b) => b.priority - a.priority);
    const alert = queueRef.current.shift()!;

    lastAlertTimeRef.current = Date.now();

    // Play the tone
    if (audioEnabledRef.current && AudioAlertService.isAvailable()) {
      AudioAlertService.playThreatAlert(alert.severity);
    }

    // Speak TTS (with cooldown) — call through the ref so we always use the
    // latest version of speakText even though the hook was instantiated early.
    if (voiceEnabledRef.current) {
      const voiceElapsed = now - lastVoiceTimeRef.current;
      if (voiceElapsed >= VOICE_COOLDOWN_MS) {
        lastVoiceTimeRef.current = Date.now();
        speakTextRef.current(VOICE_MESSAGES[alert.severity]);
      }
    }

    // Schedule next item
    setTimeout(() => {
      isProcessingRef.current = false;
      processQueueRef.current();
    }, MIN_ALERT_INTERVAL_MS);
  };

  const processQueue = useCallback(() => {
    processQueueRef.current();
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Trigger an audio alert for a threat incident.
   * Deduplicates by incidentId. Queues with priority.
   */
  const triggerThreatAlert = useCallback(
    (incident: ThreatIncident) => {
      const id = String(incident.id || '');
      const severityRaw = (incident.severity || '').toUpperCase() as AlertSeverity;
      const severity = VALID_SEVERITIES.has(severityRaw) ? severityRaw : null;

      if (!severity) return;
      if (!audioEnabledRef.current && !voiceEnabledRef.current) return;

      // Dedup check
      if (id && alertedIdsRef.current.has(id)) return;

      // Track alerted ID
      if (id) {
        alertedIdsRef.current.add(id);
        alertedIdsOrderRef.current.push(id);

        // FIFO eviction to keep memory bounded
        if (alertedIdsOrderRef.current.length > MAX_ALERTED_IDS) {
          const evicted = alertedIdsOrderRef.current.shift()!;
          alertedIdsRef.current.delete(evicted);
        }
      }

      // Add to priority queue
      queueRef.current.push({
        severity,
        priority: SEVERITY_PRIORITY[severity],
        incidentId: id,
      });

      processQueue();
    },
    [processQueue]
  );

  /**
   * Play a sample alert without generating a backend event.
   */
  const playTestAlert = useCallback(() => {
    AudioAlertService.unlockAudioContext()
      .then(() => {
        if (AudioAlertService.isAvailable()) {
          AudioAlertService.playNotificationSound();
        }
      })
      .catch(() => { /* */ });
  }, []);

  /**
   * Unlock the AudioContext — call this from any click / keydown handler.
   */
  const unlockAudio = useCallback(() => {
    AudioAlertService.unlockAudioContext().catch(() => { /* */ });
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      AudioAlertService.stopAlertSound();
    };
  }, []);

  return {
    audioEnabled,
    voiceEnabled,
    volume,
    audioAvailable,
    setAudioEnabled,
    setVoiceEnabled,
    setVolume,
    triggerThreatAlert,
    playTestAlert,
    unlockAudio,
  };
}
