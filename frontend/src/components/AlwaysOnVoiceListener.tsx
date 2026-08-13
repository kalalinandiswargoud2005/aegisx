import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const WAKE_WORDS = ['hey astra', 'astra', 'hey axis', 'hey jarvis', 'jarvis', 'hey agis'];

function stripWakeWord(text: string): string {
  let result = text;
  WAKE_WORDS.forEach((w) => {
    result = result.replace(new RegExp(w, 'gi'), '').trim();
  });
  return result.replace(/^[,.\s]+/, '').trim();
}

export function AlwaysOnVoiceListener() {
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isOverlayOpenRef = useRef<boolean>(false);
  const sendTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('[JARVIS Voice] Web Speech API not supported in this browser.');
      return;
    }

    // Explicitly request mic permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('[JARVIS Voice] Mic permission granted.');
          initSpeech(SR);
        })
        .catch(() => {
          toast.error('Microphone permission blocked. Please allow mic in browser settings.');
        });
    } else {
      initSpeech(SR);
    }

    // Handle manual button clicks from Header
    const handleManualTrigger = () => {
      isOverlayOpenRef.current = true;
      toast.info('🎙️ JARVIS Voice Active — Speak a command');
      window.dispatchEvent(new CustomEvent('open-jarvis-gui'));
    };

    window.addEventListener('trigger-voice-assistant', handleManualTrigger);

    function initSpeech(SpeechRecognitionClass: any) {
      if (isListeningRef.current) return;
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        isListeningRef.current = true;
        console.log('[JARVIS Voice] Master single listener ACTIVE.');
      };

      rec.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += t;
          else interimText += t;
        }

        const fullRaw = (finalText || interimText).toLowerCase();
        const containsWake = WAKE_WORDS.some((w) => fullRaw.includes(w));

        if (containsWake || isOverlayOpenRef.current) {
          isOverlayOpenRef.current = true;
          window.dispatchEvent(new CustomEvent('open-jarvis-gui'));

          const cleanedQuery = stripWakeWord(fullRaw);

          // Stream live transcript to UI
          window.dispatchEvent(new CustomEvent('jarvis-transcript-stream', {
            detail: { text: cleanedQuery || fullRaw }
          }));

          // Debounce auto-execute after silence
          if (finalText && cleanedQuery) {
            if (sendTimeoutRef.current) clearTimeout(sendTimeoutRef.current);
            sendTimeoutRef.current = setTimeout(() => {
              console.log('[JARVIS Voice] Executing Command:', cleanedQuery);
              window.dispatchEvent(new CustomEvent('jarvis-execute-command', {
                detail: { query: cleanedQuery }
              }));
              isOverlayOpenRef.current = false;
            }, 1200);
          }
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[JARVIS Voice] Error:', e.error);
        }
      };

      rec.onend = () => {
        isListeningRef.current = false;
        // Continuous single loop restart without competing instances
        setTimeout(() => {
          try {
            rec.start();
          } catch (_) {}
        }, 500);
      };

      try {
        rec.start();
      } catch (_) {}

      recognitionRef.current = rec;
    }

    return () => {
      window.removeEventListener('trigger-voice-assistant', handleManualTrigger);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  return null;
}
