/**
 * AudioAlertService.ts
 *
 * Singleton service that owns a single AudioContext and generates
 * all ASTRA threat alert tones using the Web Audio API.
 *
 * - No external audio files required.
 * - Works in Chromium / Chrome on Raspberry Pi OS.
 * - Gracefully degrades when Web Audio API is unavailable.
 *
 * FIX: playSequence now resumes the AudioContext first, then plays,
 *      instead of exiting early when the context is suspended.
 */

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface ToneStep {
  frequency: number;
  duration: number;    // seconds
  type: OscillatorType;
  gain: number;        // 0–1 relative to master volume
  startOffset: number; // seconds from sequence start
}

// ── Tone sequences per severity ──────────────────────────────────────────────

const TONE_SEQUENCES: Record<AlertSeverity, ToneStep[]> = {
  CRITICAL: [
    { frequency: 880,  duration: 0.12, type: 'square', gain: 0.6, startOffset: 0.00 },
    { frequency: 1100, duration: 0.12, type: 'square', gain: 0.6, startOffset: 0.17 },
    { frequency: 880,  duration: 0.12, type: 'square', gain: 0.6, startOffset: 0.34 },
  ],
  HIGH: [
    { frequency: 660,  duration: 0.15, type: 'square', gain: 0.50, startOffset: 0.00 },
    { frequency: 880,  duration: 0.15, type: 'square', gain: 0.50, startOffset: 0.21 },
  ],
  MEDIUM: [
    { frequency: 550,  duration: 0.20, type: 'sine',   gain: 0.40, startOffset: 0.00 },
  ],
  LOW: [
    { frequency: 440,  duration: 0.18, type: 'sine',   gain: 0.25, startOffset: 0.00 },
  ],
};

const NOTIFICATION_TONE: ToneStep[] = [
  { frequency: 660, duration: 0.10, type: 'sine', gain: 0.35, startOffset: 0.00 },
  { frequency: 880, duration: 0.10, type: 'sine', gain: 0.35, startOffset: 0.12 },
];

const SUCCESS_TONE: ToneStep[] = [
  { frequency: 523, duration: 0.08, type: 'sine', gain: 0.35, startOffset: 0.00 },
  { frequency: 659, duration: 0.08, type: 'sine', gain: 0.35, startOffset: 0.10 },
  { frequency: 784, duration: 0.16, type: 'sine', gain: 0.35, startOffset: 0.20 },
];

// ── Service class ─────────────────────────────────────────────────────────────

class AudioAlertServiceClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.7;
  private available = true;
  private activeNodes: AudioScheduledSourceNode[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) {
        this.available = false;
        console.warn('[AudioAlertService] Web Audio API not available.');
        return;
      }

      this.ctx = new AudioContextCtor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch (err) {
      this.available = false;
      console.warn('[AudioAlertService] Failed to create AudioContext:', err);
    }
  }

  /** Returns true if Web Audio API is available and usable. */
  isAvailable(): boolean {
    return this.available && this.ctx !== null;
  }

  /**
   * Attempt to resume the AudioContext after a user gesture.
   * Call this inside any click/keydown handler to satisfy browser autoplay policy.
   */
  async unlockAudioContext(): Promise<void> {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (err) {
      console.warn('[AudioAlertService] Could not resume AudioContext:', err);
    }
  }

  /** Set master volume (0–1). */
  setAlertVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.ctx!.currentTime,
        0.01
      );
    }
  }

  /** Stop any currently playing alert tones immediately. */
  stopAlertSound(): void {
    this.activeNodes.forEach((node) => {
      try { node.stop(); } catch (_) { /* already stopped */ }
    });
    this.activeNodes = [];
  }

  /** Play a severity-specific tone sequence. */
  playThreatAlert(severity: AlertSeverity): void {
    this.playSequence(TONE_SEQUENCES[severity]);
  }

  /** Play a generic soft notification tone. */
  playNotificationSound(): void {
    this.playSequence(NOTIFICATION_TONE);
  }

  /** Play a success tone. */
  playSuccessSound(): void {
    this.playSequence(SUCCESS_TONE);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Play a sequence of tones.
   *
   * If the AudioContext is suspended (browser autoplay policy), this method
   * resumes it first and THEN schedules the notes — so audio always plays
   * as long as a user gesture has occurred at some point in the session.
   */
  private playSequence(steps: ToneStep[]): void {
    if (!this.ctx || !this.masterGain || !this.available) return;

    if (this.ctx.state === 'suspended') {
      // Resume the context, then play once it is running.
      this.ctx.resume()
        .then(() => this.scheduleNotes(steps))
        .catch((err) => console.warn('[AudioAlertService] resume failed:', err));
      return;
    }

    this.scheduleNotes(steps);
  }

  /** Schedule tone steps on the AudioContext timeline. */
  private scheduleNotes(steps: ToneStep[]): void {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    steps.forEach((step) => {
      const osc = this.ctx!.createOscillator();
      const envGain = this.ctx!.createGain();

      osc.type = step.type;
      osc.frequency.value = step.frequency;

      const start = now + step.startOffset;
      const end   = start + step.duration;

      // Attack / release envelope to avoid clicks
      envGain.gain.setValueAtTime(0, start);
      envGain.gain.linearRampToValueAtTime(step.gain, start + 0.005);
      envGain.gain.setValueAtTime(step.gain, end - 0.01);
      envGain.gain.linearRampToValueAtTime(0, end);

      osc.connect(envGain);
      envGain.connect(this.masterGain!);

      osc.start(start);
      osc.stop(end + 0.01);

      this.activeNodes.push(osc);

      osc.onended = () => {
        const idx = this.activeNodes.indexOf(osc);
        if (idx !== -1) this.activeNodes.splice(idx, 1);
        osc.disconnect();
        envGain.disconnect();
      };
    });
  }
}

// ── Export singleton ──────────────────────────────────────────────────────────

export const AudioAlertService = new AudioAlertServiceClass();
