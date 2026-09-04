import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { useAssistant } from '@/providers/AssistantProvider';
import { JarvisCore } from '@/components/JarvisCore';

import {
  Bot,
  Send,
  RefreshCw,
  Zap,
  Activity,
  Power,
  PowerOff,
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Key,
  Bell,
  BellOff,
  SlidersHorizontal,
  Square,
} from 'lucide-react';

import { useAudioAlerts } from '@/hooks/useAudioAlerts';

import { useWebSocket } from '@/providers/WebSocketProvider';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  thought?: string;
  timestamp: string;
  isStreaming?: boolean;
}

const msgId = { current: 1 };

const QUICK_QUESTIONS = [
  'What is the current threat level?',
  'Are there any active ransomware alerts?',
  'Show me the status of all agents.',
  'How do I isolate a compromised device?',
  'What is the latest system anomaly detected?',
  "Summarize today's incidents.",
  'Give me a cybersecurity status report.',
  'Is the database secure?',
];

const ACTIVITY_ICONS: Record<string, string> = {
  scan: '🔍',
  action: '⚡',
  complete: '✅',
  monitor: '👁',
  alert: '⚠️',
  boot: '🚀',
};

const ACTIVITY_COLORS: Record<string, string> = {
  scan: 'text-blue-400',
  action: 'text-amber-400',
  complete: 'text-emerald-400',
  monitor: 'text-zinc-400',
  alert: 'text-orange-400',
  boot: 'text-purple-400',
};

// Keep utterances referenced so Chrome does not garbage collect them.
const globalUtterances: SpeechSynthesisUtterance[] = [];

/* =========================================================
   THOUGHT ACCORDION
========================================================= */

const ThoughtAccordion: React.FC<{ thought: string }> = ({
  thought,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full rounded-none border border-primary/20 bg-primary/5 overflow-hidden transition-all text-[10px] mb-1.5 max-w-[85%] self-start cyber-cut">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 flex items-center justify-between text-primary font-bold hover:bg-primary/10 transition-all text-left font-mono tracking-widest uppercase"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 animate-pulse text-primary" />

          {expanded
            ? 'Thought Process'
            : 'Show Thought Process'}
        </span>

        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-2 pt-1 border-t border-primary/10 text-white/60 leading-relaxed whitespace-pre-line font-mono text-[10px] bg-black/40">
          {thought}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MAIN ASSISTANT PAGE
========================================================= */

export function AssistantPage({ isGlobalMode = false }: { isGlobalMode?: boolean }) {
  const { subscribe, isConnected } = useWebSocket();
  const { openAssistant, isAssistantOpen } = useAssistant();

  /* =======================================================
     THREAT STATE
  ======================================================= */

  const [activeThreats, setActiveThreats] = useState<any[]>([]);

  const [defenseMode, setDefenseMode] = useState<
    'auto' | 'suggested' | 'manual'
  >('auto');

  /* =======================================================
     AUDIO ALERTS (declared early so triggerThreatAlert is
     available to the WebSocket subscription effect below)
  ======================================================= */

  // speakTextRef is populated after speakText is defined (see below).
  // Using a ref here avoids a forward-reference TypeScript error.
  const speakTextRef = useRef<(text: string) => void>(() => { /* placeholder */ });

  const {
    audioEnabled,
    voiceEnabled,
    volume: alertVolume,
    audioAvailable,
    setAudioEnabled,
    setVoiceEnabled,
    setVolume: setAlertVolume,
    triggerThreatAlert,
    playTestAlert,
    unlockAudio,
  } = useAudioAlerts(speakTextRef);

  /* =======================================================
     WEBSOCKET THREAT SUBSCRIPTION
  ======================================================= */

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe(
      'threats',
      (incident: any) => {
        const incidentId =
          incident.id ||
          Date.now().toString();

        setActiveThreats((prev) => [
          {
            id: incidentId,

            type:
              incident.severity === 'CRITICAL'
                ? 'alert'
                : incident.severity === 'HIGH'
                ? 'action'
                : 'scan',

            message: `${incident.type} detected on ${incident.target}`,

            timestamp:
              new Date().toLocaleTimeString(
                'en-US'
              ),

            ticker: incident.severity,
          },

          ...prev,
        ].slice(0, 50));

        /* Trigger audio alert for this incident */
        triggerThreatAlert({
          id: incidentId,
          severity: incident.severity,
        });
      }
    );

    return () => unsubscribe();
  }, [subscribe, isConnected, triggerThreatAlert]);

  /* =======================================================
     CHAT HISTORY
  ======================================================= */

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([
    {
      id: msgId.current++,
      role: 'ai',
      timestamp:
        new Date().toLocaleTimeString('en-US'),

      content: `Hello! I'm your ASTRA Cyber Defense Assistant. 🤖

I'm currently running in **${
        defenseMode === 'auto'
          ? 'Auto-Mitigation mode'
          : defenseMode === 'suggested'
          ? 'AI-Suggested Mitigation mode'
          : 'Manual Monitoring mode'
      }**.

I monitor the security events received by the ASTRA platform and help analyze threats, explain risks, and provide recovery guidance.

What would you like to know?`,
    },
  ]);

  const [input, setInput] = useState('');

  const [isThinking, setIsThinking] =
    useState(false);

  const [activePanel, setActivePanel] = useState<
    'chat' | 'feed'
  >('chat');

  /* =======================================================
     VOICE
  ======================================================= */

  const [isListening, setIsListening] =
    useState(false);

  const [speechEnabled, setSpeechEnabled] =
    useState(true);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      finalTranscriptRef.current = '';
      setInput('');
      setTimeout(() => {
        isListeningRef.current = true;
        setIsListening(true);
        try {
          recognitionRef.current?.start();
        } catch (_) {}
      }, 400);
    }
  }, []);

  /* =======================================================
     GEMINI
  ======================================================= */

  const [geminiKey, setGeminiKey] =
    useState(() => {
      return (
        localStorage.getItem(
          'astra_gemini_key'
        ) ||
        import.meta.env.VITE_GEMINI_API_KEY ||
        ''
      );
    });

  const [showKeyInput, setShowKeyInput] =
    useState(false);

  const [tempKey, setTempKey] =
    useState('');

  /* =======================================================
     SAVE GEMINI KEY
  ======================================================= */

  const saveGeminiKey = () => {
    const key = tempKey.trim();

    if (!key) return;

    localStorage.setItem(
      'astra_gemini_key',
      key
    );

    setGeminiKey(key);
    setShowKeyInput(false);

    setMessages((prev) => [
      ...prev,
      {
        id: msgId.current++,
        role: 'ai',
        content:
          '✅ **Gemini API Key saved successfully!**\n\nThe ASTRA AI Assistant is now ready.',
        timestamp:
          new Date().toLocaleTimeString(
            'en-US'
          ),
      },
    ]);
  };

  /* =======================================================
     REFS
  ======================================================= */

  const chatRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const recognitionRef =
    useRef<any>(null);

  const isListeningRef =
    useRef(false);

  const finalTranscriptRef =
    useRef('');

  const silenceTimerRef =
    useRef<any>(null);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages]);

  /* =======================================================
     TEXT TO SPEECH
  ======================================================= */

  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(
          /\*\*(.*?)\*\*/g,
          '$1'
        )
        .replace(/•/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(
          /🤖|👥|🔍|⚡|✅|👁|⚠️|🚀|🥇|📈|📊|₿/g,
          ''
        );

      const chunks =
        cleanText.match(
          /[^.!?\n]+[.!?\n]+/g
        ) || [cleanText];

      // Pause Mic listening so AI does not listen to its own speaker output!
      isListeningRef.current = false;
      setIsListening(false);
      finalTranscriptRef.current = '';
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      try {
        recognitionRef.current?.abort();
      } catch (_) {}

      setIsSpeaking(true);

      const validChunks = chunks.filter(c => c.trim().length > 0);
      let completedChunks = 0;

      validChunks.forEach((chunk) => {
        if (!chunk.trim()) return;

        const utterance =
          new SpeechSynthesisUtterance(
            chunk.trim()
          );

        const voices =
          window.speechSynthesis.getVoices();

        const femaleVoice =
          voices.find(
            (voice) =>
              voice.lang.includes('en') &&
              (
                voice.name
                  .toLowerCase()
                  .includes('female') ||
                voice.name
                  .toLowerCase()
                  .includes('zira') ||
                voice.name
                  .toLowerCase()
                  .includes('samantha')
              )
          );

        utterance.voice =
          femaleVoice ||
          voices.find(
            (voice) =>
              voice.lang.includes(
                'en-US'
              ) ||
              voice.lang.includes(
                'en-GB'
              )
          ) ||
          voices[0];

        globalUtterances.push(
          utterance
        );

        utterance.onend = () => {
          completedChunks++;
          if (completedChunks >= validChunks.length) {
            setIsSpeaking(false);
            // Auto-resume Always-On Mic listening when AI finishes speaking
            setTimeout(() => {
              isListeningRef.current = true;
              setIsListening(true);
              try {
                recognitionRef.current?.start();
              } catch (_) {}
            }, 500);
          }
          const index =
            globalUtterances.indexOf(
              utterance
            );

          if (index > -1) {
            globalUtterances.splice(
              index,
              1
            );
          }
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(
          utterance
        );
      });
    },
    []
  );

  // Sync speakTextRef so the audio hook always calls the latest speakText.
  speakTextRef.current = speakText;

  /* =======================================================
     SEND MESSAGE TO GEMINI
  ======================================================= */

  const sendMessage = useCallback(
    async (text: string) => {
      if (
        !text.trim() ||
        isThinking
      ) {
        return;
      }

      /* Stop current speech */

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      /* Add user message */

      const userMsg: ChatMessage = {
        id: msgId.current++,
        role: 'user',
        content: text.trim(),
        timestamp:
          new Date().toLocaleTimeString(
            'en-US'
          ),
      };

      setMessages((prev) => [
        ...prev,
        userMsg,
      ]);

      setInput('');
      setIsThinking(true);

      /* Unlock speech */

      if (
        speechEnabled &&
        window.speechSynthesis
      ) {
        const unlockUtterance =
          new SpeechSynthesisUtterance(
            ''
          );

        unlockUtterance.volume = 0;

        window.speechSynthesis.speak(
          unlockUtterance
        );
      }

      /* Check Gemini API key */

      if (!geminiKey) {
        setShowKeyInput(true);

        const fallbackMsg: ChatMessage = {
          id: msgId.current++,
          role: 'ai',
          content:
            '⚠️ Please provide your Gemini API Key in the settings panel above to use the AI Assistant.',
          timestamp:
            new Date().toLocaleTimeString(
              'en-US'
            ),
        };

        setMessages((prev) => [
          ...prev,
          fallbackMsg,
        ]);

        setIsThinking(false);

        return;
      }

      let aiMsgId = 0;

      try {
        /* =================================================
           GEMINI CLIENT
        ================================================= */

        const ai = new GoogleGenAI({
          apiKey: geminiKey,
        });

        /* =================================================
           ASTRA SYSTEM INSTRUCTION
        ================================================= */

        const systemInstruction = `
You are the ASTRA Cyber Defense Assistant.

You are an AI cybersecurity assistant integrated into the ASTRA Cybersecurity Appliance.

USER ROLE:
Administrator

DEFENSE MODE:
${defenseMode}

SYSTEM STATUS:
Backend:
${isConnected ? 'CONNECTED' : 'DISCONNECTED'}

IMPORTANT ARCHITECTURE:

The ASTRA Windows Agent is a monitoring-only endpoint agent.

The Windows Agent:

- Monitors Windows security events
- Detects predefined security conditions
- Analyzes telemetry
- Generates threat events
- Sends events to the backend

The Windows Agent MUST NOT:
- Perform attacks
- Execute offensive commands
- Automatically recover the system
- Modify the Windows system without authorization

The ASTRA backend is the central threat-processing system.

The AI Assistant:
- Analyzes received threat information
- Explains the threat
- Explains how the threat may have occurred
- Explains severity
- Explains risk
- Explains business impact
- Recommends immediate containment
- Provides recovery guidance
- Provides prevention recommendations

RECOVERY:

Recovery is manual and must be performed through the ASTRA Recovery Wizard.

Never claim that you actually executed a recovery action.

Never claim that you disabled an account, killed a process, blocked an IP, isolated a device, restored a file, or changed Windows configuration unless the backend explicitly reports that action as completed.

ACTIVE THREATS:

${
  activeThreats.length === 0
    ? 'No active threats currently available.'
    : activeThreats
        .slice(0, 10)
        .map(
          (t) =>
            `- [${t.ticker}] ${t.message} at ${t.timestamp}`
        )
        .join('\n')
}

RULES:

1. Be professional, concise, and technically accurate.

2. When the user asks about current threats, use the Active Threats information supplied above.

3. Do not invent security incidents.

4. If there are no active threats, clearly say that no active threats are currently available.

5. Explain cybersecurity concepts in simple language when appropriate.

6. Use Markdown.

7. Use bullet points for recommendations.

8. For a detected threat, structure the answer where appropriate as:

Threat
What happened
How it can happen
Severity
Risk
Immediate action
Recovery steps
Prevention

9. Recovery steps must be recommendations only.

10. Do not provide offensive attack instructions.

11. Do not claim that ASTRA automatically repaired the system.

12. If asked to perform an attack, refuse the offensive action and instead explain how ASTRA could safely detect the corresponding event.

13. For security incidents, prioritize containment, evidence preservation, credential protection, patching, verification, and monitoring.

14. If the user asks about one of the predefined ASTRA threats, explain the threat using its configured threat ID when available.

15. If the user asks about hardware, remember that the current prototype uses a Raspberry Pi and touchscreen architecture. ESP32, LEDs, and buzzer have been removed from the current design.

16. Never expose API keys, credentials, JWTs, passwords, or other secrets.

17. If the user asks a general or non-cybersecurity question, answer it normally and helpfully. You do not need to restrict yourself exclusively to cybersecurity.
`;

        /* =================================================
           CREATE AI MESSAGE
        ================================================= */

        aiMsgId = msgId.current++;

        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'ai',
          content: '',
          thought:
            'Analyzing ASTRA security context...',
          timestamp:
            new Date().toLocaleTimeString(
              'en-US'
            ),
          isStreaming: true,
        };

        setMessages((prev) => [
          ...prev,
          aiMsg,
        ]);

        setIsThinking(false);

        /* =================================================
           CHAT CONTEXT
        ================================================= */

        const chatContext =
          messages
            .slice(-8)
            .map((message) => ({
              role:
                message.role === 'ai'
                  ? 'model'
                  : 'user',

              parts: [
                {
                  text:
                    message.content,
                },
              ],
            }));

        chatContext.push({
          role: 'user',
          parts: [
            {
              text: text.trim(),
            },
          ],
        });

        /* =================================================
           GEMINI STREAM WITH MODEL FALLBACK
        ================================================= */

        const GEMINI_MODELS = [
          'gemini-3.6-flash',
          'gemini-3.6-pro',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
        ];

        let responseStream: any = null;
        let lastModelError: any = null;

        for (const modelCandidate of GEMINI_MODELS) {
          try {
            responseStream = await ai.models.generateContentStream({
              model: modelCandidate,
              contents: chatContext,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            if (responseStream) {
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Gemini model ${modelCandidate} failed, trying fallback:`, modelErr);
            lastModelError = modelErr;
          }
        }

        if (!responseStream) {
          throw lastModelError || new Error('All Gemini API models failed to respond.');
        }

        /* =================================================
           STREAM RESPONSE
        ================================================= */

        let fullContent = '';

        for await (
          const chunk of responseStream
        ) {
          if (chunk.text) {
            fullContent +=
              chunk.text;

            setMessages((prev) =>
              prev.map((message) =>
                message.id ===
                aiMsgId
                  ? {
                      ...message,
                      content:
                        fullContent,
                    }
                  : message
              )
            );
          }
        }

        /* =================================================
           FINISH STREAM
        ================================================= */

        setMessages((prev) =>
          prev.map((message) =>
            message.id ===
            aiMsgId
              ? {
                  ...message,
                  isStreaming:
                    false,
                }
              : message
          )
        );

        /* =================================================
           SPEAK RESPONSE
        ================================================= */

        if (
          speechEnabled &&
          fullContent.trim()
        ) {
          speakText(
            fullContent
          );
        }
      } catch (error: any) {
        console.error(
          'Gemini API Error:',
          error
        );

        const errorMessage =
          error?.message ||
          (typeof error === 'object' ? JSON.stringify(error) : String(error)) ||
          'Unknown Gemini API error';

        const lowerError = errorMessage.toLowerCase();

        /* Check for 429 Rate Limit / Quota Exceeded */
        const is429 =
          error?.status === 429 ||
          error?.code === 429 ||
          lowerError.includes('429') ||
          lowerError.includes('resource_exhausted') ||
          lowerError.includes('quota exceeded') ||
          lowerError.includes('rate-limit') ||
          lowerError.includes('rate limit');

        if (is429) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    content: `⚠️ **Gemini API Quota Exceeded / Rate Limit (429)**\n\nThe free-tier API quota limit for Gemini has been temporarily reached. Please retry in ~15-30 seconds, or click the **KEY** button at the top to configure your personal Google Gemini API key.`,
                    isStreaming: false,
                  }
                : msg
            )
          );

          setIsThinking(false);
          return;
        }

        /* Generic Error Message */
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  content: `❌ **Failed to connect to Gemini API**\n\nError: ${errorMessage}\n\nPlease check your internet connection, API key, or model availability.`,
                  isStreaming: false,
                }
              : msg
          )
        );

        setIsThinking(false);

        /* ONLY wipe out key & show key prompt if authentication specifically failed (401 / invalid key) */
        const isInvalidKey =
          error?.status === 401 ||
          lowerError.includes('api_key_invalid') ||
          lowerError.includes('invalid_api_key') ||
          lowerError.includes('api key not valid');

        if (isInvalidKey) {
          setShowKeyInput(true);
          setGeminiKey('');
          localStorage.removeItem('astra_gemini_key');
        }
      }
    },

    [
      isThinking,
      geminiKey,
      speechEnabled,
      speakText,
      activeThreats,
      defenseMode,
      isConnected,
      messages,
    ]
  );

  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

  useEffect(() => {
    if (!isGlobalMode) return; // Only global instance handles the microphone

    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        'Speech Recognition is not supported by this browser.'
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (
      event: any
    ) => {
      let interim = '';
      let finalText = '';

      for (
        let i =
          event.resultIndex;
        i <
        event.results.length;
        ++i
      ) {
        if (
          event.results[i].isFinal
        ) {
          finalText +=
            event.results[i][0]
              .transcript;
        } else {
          interim +=
            event.results[i][0]
              .transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current +=
          finalText + ' ';
      }

      let processedSpeech = (finalTranscriptRef.current + interim).toLowerCase().trim();
      
      let wakeWordFound = false;
      // Wake Word check
      if (
        processedSpeech.includes('hey astra') || 
        processedSpeech.includes('hello astra') || 
        processedSpeech.includes('hi astra') || 
        processedSpeech.includes('wakeup astra')
      ) {
          wakeWordFound = true;
          if (!isAssistantOpen) {
              openAssistant();
          }
          processedSpeech = processedSpeech.replace(/.*(hey astra|hello astra|hi astra|wakeup astra)/g, '').trim();
          
          if (!finalText && processedSpeech.length === 0) {
              // Just woke up, don't set input yet if there's no command following
              return;
          }
      }

      // If the assistant is closed and the wake word wasn't spoken, ignore the speech
      if (!isAssistantOpen && !wakeWordFound) {
          if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
          }
          // Clear the buffer after a short silence so it doesn't grow infinitely
          silenceTimerRef.current = setTimeout(() => {
              finalTranscriptRef.current = '';
              setInput('');
          }, 1200);
          return;
      }

      // Stop Word check
      if (processedSpeech.includes('stop')) {
          if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
          }
          stopSpeaking(); // existing helper function
          processedSpeech = '';
          finalTranscriptRef.current = '';
          setInput('');
          return;
      }

      setInput(processedSpeech);

      /* Hands-Free Auto-Submit on 1.2s Silence */
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (processedSpeech.length > 2) {
        silenceTimerRef.current = setTimeout(() => {
          if (processedSpeech.trim()) {
            isListeningRef.current = false;
            setIsListening(false);
            try {
              recognitionRef.current?.stop();
            } catch (_) {}
            sendMessage(processedSpeech);
            finalTranscriptRef.current = '';
          }
        }, 1200);
      }
    };

    recognition.onerror = (
      event: any
    ) => {
      if (
        event.error === 'aborted' ||
        event.error === 'no-speech' ||
        event.error === 'network'
      ) {
        return;
      }
      
      // For severe errors (like not-allowed), we stop listening permanently
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          isListeningRef.current = false;
          setIsListening(false);
      }
      
      console.warn(
        'Speech recognition error:',
        event.error
      );
    };

    recognition.onend = () => {
      if (
        isListeningRef.current
      ) {
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        }, 800);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current =
      recognition;

    // Start listening on first user interaction or mount
    const handleFirstGesture = () => {
      if (!isListeningRef.current) {
        isListeningRef.current = true;
        try {
          recognition.start();
        } catch (_) {}
      }
    };
    window.addEventListener('click', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      isListeningRef.current =
        false;

      try {
        recognition.abort();
      } catch (_) {}

      if (
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =======================================================
     TOGGLE LISTENING
  ======================================================= */

  const toggleListening = () => {
    if (
      isListeningRef.current
    ) {
      isListeningRef.current =
        false;

      setIsListening(false);

      try {
        recognitionRef.current?.stop();
      } catch (_) {}

      if (input.trim()) {
        sendMessage(input);
      }

      return;
    }

    isListeningRef.current =
      true;

    setIsListening(true);

    finalTranscriptRef.current =
      '';

    setInput('');

    if (
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn('Mic start error', e);
    }
  };

  /* =======================================================
     TOGGLE SPEECH
  ======================================================= */

  const toggleSpeech = () => {
    setSpeechEnabled((previous) => {
      const next = !previous;

      if (
        !next &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }

      return next;
    });
  };

  /* =======================================================
     RENDER MESSAGE
  ======================================================= */

  const renderMessageContent = (
    content: string
  ) => {
    return content
      .split('\n')
      .map((line, index) => {
        const boldLine =
          line.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="text-white font-semibold">$1</strong>'
          );

        return (
          <p
            key={index}
            className={`${
              line === ''
                ? 'h-2'
                : ''
            } text-sm leading-relaxed`}
            dangerouslySetInnerHTML={{
              __html:
                boldLine,
            }}
          />
        );
      });
  };

  /* =======================================================
     UI
  ======================================================= */

  if (isGlobalMode) {
      return (
          <div className="w-full h-full bg-background overflow-hidden relative">
              <JarvisCore 
                  isSpeaking={isSpeaking}
                  isThinking={isThinking}
                  isListening={isListening}
                  transcript={input}
              />
          </div>
      );
  }

  return (
    <div className={`flex flex-col bg-background h-[calc(100vh-4rem)]`}>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="px-4 md:px-6 py-4 border-b border-border-color flex-shrink-0 bg-surface/50 backdrop-blur">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center flex-shrink-0 cyber-cut">

              <Bot className="w-5 h-5 text-primary" />

            </div>

            <div>

              <h1 className="text-xl font-bold font-mono tracking-widest uppercase text-glow text-white">
                ASTRA AI Assistant
              </h1>

              <div className="flex items-center gap-2 mt-0.5">

                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    defenseMode ===
                    'auto'
                      ? 'bg-success animate-pulse'
                      : defenseMode ===
                        'suggested'
                      ? 'bg-warning animate-pulse'
                      : 'bg-gray-500'
                  }`}
                />

                <span className="text-[10px] text-white/50 uppercase tracking-widest">

                  {defenseMode ===
                  'auto'
                    ? 'Auto-Mitigation Active'
                    : defenseMode ===
                      'suggested'
                    ? 'AI-Suggested Active'
                    : 'Manual Mode'}

                </span>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Mobile panel toggle */}

            <div className="flex md:hidden rounded-lg bg-surface border border-border-color p-0.5">

              <button
                onClick={() =>
                  setActivePanel(
                    'chat'
                  )
                }
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activePanel ===
                  'chat'
                    ? 'bg-primary text-black'
                    : 'text-white/50'
                }`}
              >
                Chat
              </button>

              <button
                onClick={() =>
                  setActivePanel(
                    'feed'
                  )
                }
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all relative ${
                  activePanel ===
                  'feed'
                    ? 'bg-primary text-black'
                    : 'text-white/50'
                }`}
              >
                Activity

                {defenseMode !==
                  'manual' && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse ${
                      defenseMode ===
                      'auto'
                        ? 'bg-success'
                        : 'bg-warning'
                    }`}
                  />
                )}

              </button>

            </div>

            {/* Voice Toggle */}
            <button
              onClick={
                toggleSpeech
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-none text-xs font-bold transition-all border cyber-cut ${
                speechEnabled
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-border-color text-white/50 hover:text-white/80'
              }`}
              title={
                speechEnabled
                  ? 'Voice output enabled'
                  : 'Voice output muted'
              }
            >

              {speechEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}

              <span className="hidden sm:inline">
                {speechEnabled
                  ? 'VOICE ON'
                  : 'MUTE'}
              </span>
            </button>

            {/* Key Config Button */}
            <button
              onClick={() => setShowKeyInput((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-none text-xs font-bold transition-all border cyber-cut ${
                showKeyInput
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface border-border-color text-white/50 hover:text-white/80'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">KEY</span>
            </button>

            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1.5 px-3 py-2 rounded-none text-xs font-bold bg-danger/20 border border-danger text-danger hover:bg-danger hover:text-white transition-all animate-pulse cyber-cut shadow-[0_0_15px_rgba(255,42,109,0.5)]"
                title="Stop AI voice speech immediately"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono uppercase tracking-wider">STOP SPEAKING</span>
              </button>
            )}

            {/* Defense mode */}

            <button
              onClick={() =>
                setDefenseMode(
                  defenseMode ===
                    'auto'
                    ? 'suggested'
                    : defenseMode ===
                      'suggested'
                    ? 'manual'
                    : 'auto'
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all cyber-cut ${
                defenseMode ===
                'auto'
                  ? 'bg-success/10 border border-success/30 text-success'
                  : defenseMode ===
                    'suggested'
                  ? 'bg-warning/10 border border-warning/30 text-warning'
                  : 'bg-surface border-border-color text-white/50'
              }`}
            >

              {defenseMode ===
              'auto' ? (
                <>
                  <Power className="w-3.5 h-3.5" />
                  AUTO
                </>
              ) : defenseMode ===
                'suggested' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  SUGGESTED
                </>
              ) : (
                <>
                  <PowerOff className="w-3.5 h-3.5" />
                  MANUAL
                </>
              )}

            </button>

          </div>

        </div>

      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* =================================================
            CHAT
        ================================================= */}

        <div
          className={`flex flex-col flex-1 min-w-0 ${
            activePanel === 'feed'
              ? 'hidden md:flex'
              : 'flex'
          } md:flex relative z-10`}
        >

          {/* Messages */}

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
          >

            {/* Gemini key */}

            {showKeyInput && (
              <div className="mb-4 p-4 rounded-none border border-primary/30 bg-primary/10 flex flex-col gap-3 cyber-cut">

                <div className="flex items-center gap-2">

                  <Key className="w-4 h-4 text-primary" />

                  <span className="text-sm font-bold text-primary tracking-widest uppercase">
                    Configure Gemini API Key
                  </span>

                </div>

                <p className="text-xs text-primary/80">

                  Enter your Google Gemini API key to enable the AI Assistant.

                </p>

                <div className="flex gap-2">

                  <input
                    type="password"
                    value={tempKey}
                    onChange={(event) =>
                      setTempKey(
                        event.target
                          .value
                      )
                    }
                    placeholder="AIzaSy..."
                    className="flex-1 bg-surface border border-border-color rounded-none px-3 py-2 text-white text-xs outline-none focus:border-primary/50 font-mono"
                  />

                  <button
                    onClick={
                      saveGeminiKey
                    }
                    className="px-4 py-2 rounded-none bg-primary text-black text-xs font-bold hover:bg-primary/80 cyber-cut uppercase tracking-widest"
                  >
                    Save Key
                  </button>

                  {geminiKey && (
                    <button
                      onClick={() =>
                        setShowKeyInput(
                          false
                        )
                      }
                      className="px-4 py-2 rounded-none bg-surface text-white border border-border-color text-xs font-bold hover:bg-surface/80 cyber-cut uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}

                </div>

              </div>
            )}

            {/* Chat messages */}

            {messages.map(
              (message) => (
                <div
                  key={
                    message.id
                  }
                  className={`flex gap-3 ${
                    message.role ===
                    'user'
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >

                  <div
                    className={`w-8 h-8 rounded-none flex items-center justify-center text-xs flex-shrink-0 cyber-cut ${
                      message.role ===
                      'ai'
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-blue-500/20 border border-blue-500/50'
                    }`}
                  >

                    {message.role ===
                    'ai' ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      '👤'
                    )}

                  </div>

                  <div
                    className={`max-w-[75%] ${
                      message.role ===
                      'user'
                        ? 'items-end'
                        : 'items-start'
                    } flex flex-col w-full`}
                  >

                    {message.role ===
                      'ai' &&
                      message.thought && (
                        <ThoughtAccordion
                          thought={
                            message.thought
                          }
                        />
                      )}

                    <div
                      className={`rounded-none px-4 py-3 font-mono space-y-1 ${
                        message.role ===
                        'user'
                          ? 'bg-blue-500/10 border border-blue-500/30 text-blue-100'
                          : 'bg-surface border border-border-color text-white/90 w-full'
                      }`}
                    >

                      {renderMessageContent(
                        message.content
                      )}

                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                      )}

                    </div>

                    <div className="text-[10px] text-white/40 mt-1 px-1 font-mono">

                      {message.timestamp}

                    </div>

                  </div>

                </div>
              )
            )}

            {/* Thinking */}

            {isThinking && (
              <div className="flex gap-3">

                <div className="w-8 h-8 rounded-none bg-primary/20 border border-primary/50 flex items-center justify-center text-xs cyber-cut">

                  <Bot className="w-4 h-4 text-primary" />

                </div>

                <div className="bg-surface border border-border-color rounded-none px-4 py-3 flex items-center gap-2">

                  <RefreshCw className="w-3 h-3 text-primary animate-spin" />

                  <span className="text-xs font-mono text-white/50 tracking-widest uppercase">

                    Analyzing threats...

                  </span>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              QUICK QUESTIONS
          ================================================= */}

          <div className="px-4 pb-2 flex-shrink-0">

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

              {QUICK_QUESTIONS.map(
                (question, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      sendMessage(
                        question
                      )
                    }
                    disabled={
                      isThinking
                    }
                    className="flex-shrink-0 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-none border border-border-color bg-surface text-white/60 hover:text-primary hover:border-primary/50 transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    {question}
                  </button>
                )
              )}

            </div>

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="p-4 border-t border-border-color flex-shrink-0 bg-surface/80 backdrop-blur">

            <div className="flex gap-3 items-center">

              <input
                ref={inputRef}
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                onKeyDown={(event) => {
                  unlockAudio();
                  if (
                    event.key ===
                      'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    sendMessage(
                      input
                    );
                  }
                }}
                placeholder="Ask about threats, alerts, or active defense..."
                className="flex-1 bg-surface border border-border-color rounded-none px-4 py-3 text-white text-sm outline-none focus:border-primary placeholder:text-white/30 transition-all font-mono"
                disabled={
                  isThinking
                }
              />

              {/* Microphone */}

              <button
                type="button"
                onClick={
                  toggleListening
                }
                className={`w-11 h-11 rounded-none flex items-center justify-center transition-all cyber-cut ${
                  isListening
                    ? 'bg-danger text-white animate-pulse shadow-lg shadow-danger/20 border-none'
                    : 'bg-surface border border-border-color text-white/50 hover:text-primary hover:border-primary/50'
                }`}
                title={
                  isListening
                    ? 'Listening... Click to stop'
                    : 'Speak to AI'
                }
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send */}

              <button
                onClick={() => {
                  unlockAudio();
                  sendMessage(
                    input
                  );
                }}
                disabled={
                  !input.trim() ||
                  isThinking
                }
                className="w-11 h-11 rounded-none bg-primary text-black flex items-center justify-center hover:bg-primary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed cyber-cut flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
