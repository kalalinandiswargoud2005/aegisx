/**
 * VoiceAssistantOverlay.tsx
 *
 * Full-screen voice assistant UI for AEGISX.
 *
 * ┌─ States ───────────────────────────────────────────────────────────────────┐
 * │  idle       → Pulsing orb, "Say 'Hey AEGISX' or tap the orb"             │
 * │  listening  → Red ripple animation, shows live transcript                 │
 * │  thinking   → Spinning rings, "Processing…"                               │
 * │  speaking   → Green wave bars, reads the response aloud                  │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Props
 * ─────
 *  isOpen        — controls visibility
 *  onClose       — called when user presses ✕ or Escape
 *  onSend        — called with the final transcript; parent should run AI call
 *  isSpeaking    — true while AI response is being spoken (TTS active)
 *  isThinking    — true while Gemini is generating
 *  lastResponse  — the latest AI response text (shown below orb)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  isThinking: boolean;
  isSpeaking: boolean;
  lastResponse: string;
}

// ── Wake words ────────────────────────────────────────────────────────────────
const WAKE_WORDS = ['hey aegisx', 'aegisx', 'hey axis', 'hey agis'];

function containsWakeWord(text: string): boolean {
  const lower = text.toLowerCase();
  return WAKE_WORDS.some((w) => lower.includes(w));
}

function stripWakeWord(text: string): string {
  let result = text;
  WAKE_WORDS.forEach((w) => {
    result = result.replace(new RegExp(w, 'gi'), '').trim();
  });
  return result.replace(/^[,.\s]+/, '').trim();
}

// ── Orb state → colours + label ───────────────────────────────────────────────

const STATE_CONFIG: Record<VoiceState, {
  orbColor: string;
  ringColor: string;
  glowColor: string;
  label: string;
  sublabel: string;
}> = {
  idle: {
    orbColor: 'from-cyan-600 to-blue-700',
    ringColor: 'border-cyan-400/30',
    glowColor: 'rgba(34,211,238,0.35)',
    label: 'AEGISX VOICE',
    sublabel: 'Tap the orb or say "Hey AEGISX"',
  },
  listening: {
    orbColor: 'from-red-600 to-rose-700',
    ringColor: 'border-red-400/40',
    glowColor: 'rgba(239,68,68,0.45)',
    label: 'LISTENING',
    sublabel: 'Speak now…',
  },
  thinking: {
    orbColor: 'from-violet-600 to-purple-700',
    ringColor: 'border-violet-400/40',
    glowColor: 'rgba(139,92,246,0.45)',
    label: 'PROCESSING',
    sublabel: 'AEGISX is analyzing…',
  },
  speaking: {
    orbColor: 'from-emerald-600 to-green-700',
    ringColor: 'border-emerald-400/40',
    glowColor: 'rgba(16,185,129,0.45)',
    label: 'RESPONDING',
    sublabel: 'AEGISX is speaking…',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const VoiceAssistantOverlay: React.FC<VoiceAssistantOverlayProps> = ({
  isOpen,
  onClose,
  onSend,
  isThinking,
  isSpeaking,
  lastResponse,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [visible, setVisible] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalRef       = useRef('');
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Start / stop helpers ──────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (isListeningRef.current) return;
    if (isThinking || isSpeaking) return;
    finalRef.current   = '';
    setTranscript('');
    isListeningRef.current = true;
    setVoiceState('listening');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    try { recognitionRef.current?.start(); } catch (_) {}
  }, [isThinking, isSpeaking]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (sendTimeoutRef.current) clearTimeout(sendTimeoutRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
    setVoiceState('idle');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  // ── Derived state from parent ─────────────────────────────────────────────
  useEffect(() => {
    if (isThinking)     { setVoiceState('thinking'); return; }
    if (isSpeaking)     { setVoiceState('speaking'); return; }
    if (isListeningRef.current) { setVoiceState('listening'); return; }
    setVoiceState('idle');
  }, [isThinking, isSpeaking]);

  // ── Mount animation & auto start listening ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 20);
      startListening();
    } else {
      setVisible(false);
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  // ── Keyboard: Escape to close ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // ── Listen to live stream from AlwaysOnVoiceListener ──────────────────────
  useEffect(() => {
    const handleStream = (e: any) => {
      if (e.detail && e.detail.text) {
        setTranscript(e.detail.text);
        setVoiceState('listening');
      }
    };
    window.addEventListener('jarvis-transcript-stream', handleStream);
    return () => window.removeEventListener('jarvis-transcript-stream', handleStream);
  }, []);

  if (!isOpen) return null;

  const cfg = STATE_CONFIG[voiceState];

  return (
    <div
      className="fixed inset-0 z-[9990] flex flex-col items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(14px)',
        transition: 'opacity .3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* ── Animated background grid ── */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* ── Corner decorations ── */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-cyan-500/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-cyan-500/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-cyan-500/20 pointer-events-none" />

      {/* ── Close button ── */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
      >
        <X size={22} />
      </button>

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="text-[10px] font-mono tracking-[.35em] uppercase text-cyan-400/60 mb-1">
          AEGISX CYBER DEFENSE
        </div>
        <h1
          className="text-3xl font-black font-mono tracking-widest uppercase"
          style={{ color: '#fff', textShadow: '0 0 30px rgba(34,211,238,.5)' }}
        >
          {cfg.label}
        </h1>
      </div>

      {/* ── Animated orb ── */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 220, height: 220 }}>

        {/* Outer rings */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width:  160 + i * 30,
              height: 160 + i * 30,
              borderColor: cfg.glowColor,
              opacity: voiceState === 'listening' || voiceState === 'speaking' ? 0.7 / i : 0.3 / i,
              animation: voiceState === 'idle'
                ? `ping ${2 + i * 0.5}s ease-in-out infinite`
                : voiceState === 'listening'
                ? `spin ${1.5 + i * 0.3}s linear infinite`
                : voiceState === 'thinking'
                ? `spin ${0.8 + i * 0.2}s linear infinite reverse`
                : `ping ${1 + i * 0.3}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Core orb — clickable */}
        <button
          onClick={toggleListening}
          disabled={isThinking || isSpeaking}
          className={`
            relative w-40 h-40 rounded-full
            bg-gradient-to-br ${cfg.orbColor}
            flex items-center justify-center
            transition-all duration-500
            disabled:cursor-default
            focus:outline-none
          `}
          style={{
            boxShadow: `0 0 60px ${cfg.glowColor}, 0 0 120px ${cfg.glowColor.replace('.45','.15')}`,
          }}
          title={isListeningRef.current ? 'Tap to stop' : 'Tap to speak'}
        >
          {voiceState === 'idle'      && <Mic      size={52} className="text-white/90" />}
          {voiceState === 'listening' && <MicOff   size={52} className="text-white/90 animate-pulse" />}
          {voiceState === 'thinking'  && (
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          )}
          {voiceState === 'speaking'  && (
            /* Sound wave bars */
            <div className="flex items-end gap-1.5 h-12">
              {[1,2,3,4,5].map((i) => (
                <div
                  key={i}
                  className="w-2 bg-white/80 rounded-full"
                  style={{
                    height: `${20 + i * 8}px`,
                    animation: `voice-bar-${i} ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* ── Sublabel ── */}
      <p className="text-sm font-mono text-white/50 mb-6 tracking-wider">{cfg.sublabel}</p>

      {/* ── Live transcript ── */}
      <div
        className="w-full max-w-md min-h-[56px] mx-auto px-6 text-center font-mono text-base"
        style={{
          color: voiceState === 'listening' ? '#fff' : 'rgba(255,255,255,0.4)',
          transition: 'color .3s',
        }}
      >
        {transcript
          ? <span>{transcript}</span>
          : voiceState === 'idle'
          ? <span className="text-white/25 text-sm">Tap orb or say "Hey AEGISX, …"</span>
          : null
        }
      </div>

      {/* ── Last AI response ── */}
      {lastResponse && voiceState !== 'listening' && (
        <div
          className="w-full max-w-lg mx-auto mt-6 px-6 py-4 font-mono text-xs text-white/60 text-center leading-relaxed"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
            maxHeight: 120,
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center gap-1.5 justify-center mb-1 text-[10px] text-cyan-400/60 tracking-widest uppercase">
            <Volume2 size={10} /> AEGISX said
          </div>
          <p className="line-clamp-4">{lastResponse.replace(/\*\*(.*?)\*\*/g,'$1').replace(/[*#•]/g,'').trim()}</p>
        </div>
      )}

      {/* ── Bottom hint ── */}
      <div className="absolute bottom-6 text-[10px] font-mono text-white/20 tracking-widest">
        Press ESC to close  ·  Auto-sends after 1.8 s silence
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes voice-bar-1 { from{height:10px} to{height:28px} }
        @keyframes voice-bar-2 { from{height:16px} to{height:44px} }
        @keyframes voice-bar-3 { from{height:22px} to{height:56px} }
        @keyframes voice-bar-4 { from{height:16px} to{height:44px} }
        @keyframes voice-bar-5 { from{height:10px} to{height:30px} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VoiceAssistantOverlay;
