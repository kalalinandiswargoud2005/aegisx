import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

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

export default function AssistantPage() {
  const { subscribe, isConnected } = useWebSocket();

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

      content: `Hello! I'm your AEGISX Cyber Defense Assistant. 🤖

I'm currently running in **${
        defenseMode === 'auto'
          ? 'Auto-Mitigation mode'
          : defenseMode === 'suggested'
          ? 'AI-Suggested Mitigation mode'
          : 'Manual Monitoring mode'
      }**.

I monitor the security events received by the AEGISX platform and help analyze threats, explain risks, and provide recovery guidance.

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
    useState(false);

  /* =======================================================
     GEMINI
  ======================================================= */

  const [geminiKey, setGeminiKey] =
    useState(() => {
      return (
        localStorage.getItem(
          'aegisx_gemini_key'
        ) ||
        import.meta.env.VITE_GEMINI_API_KEY ||
        ''
      );
    });

  const [showKeyInput, setShowKeyInput] =
    useState(!geminiKey);

  const [tempKey, setTempKey] =
    useState('');

  /* =======================================================
     SAVE GEMINI KEY
  ======================================================= */

  const saveGeminiKey = () => {
    const key = tempKey.trim();

    if (!key) return;

    localStorage.setItem(
      'aegisx_gemini_key',
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
          '✅ **Gemini API Key saved successfully!**\n\nThe AEGISX AI Assistant is now ready.',
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

      chunks.forEach((chunk) => {
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

      try {
        /* =================================================
           GEMINI CLIENT
        ================================================= */

        const ai = new GoogleGenAI({
          apiKey: geminiKey,
        });

        /* =================================================
           AEGISX SYSTEM INSTRUCTION
        ================================================= */

        const systemInstruction = `
You are the AEGISX Cyber Defense Assistant.

You are an AI cybersecurity assistant integrated into the AEGISX Cybersecurity Appliance.

USER ROLE:
Administrator

DEFENSE MODE:
${defenseMode}

SYSTEM STATUS:
Backend:
${isConnected ? 'CONNECTED' : 'DISCONNECTED'}

IMPORTANT ARCHITECTURE:

The AEGISX Windows Agent is a monitoring-only endpoint agent.

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

The AEGISX backend is the central threat-processing system.

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

Recovery is manual and must be performed through the AEGISX Recovery Wizard.

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

11. Do not claim that AEGISX automatically repaired the system.

12. If asked to perform an attack, refuse the offensive action and instead explain how AEGISX could safely detect the corresponding event.

13. For security incidents, prioritize containment, evidence preservation, credential protection, patching, verification, and monitoring.

14. If the user asks about one of the predefined AEGISX threats, explain the threat using its configured threat ID when available.

15. If the user asks about hardware, remember that the current prototype uses a Raspberry Pi and touchscreen architecture. ESP32, LEDs, and buzzer have been removed from the current design.

16. Never expose API keys, credentials, JWTs, passwords, or other secrets.
`;

        /* =================================================
           CREATE AI MESSAGE
        ================================================= */

        const aiMsgId =
          msgId.current++;

        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'ai',
          content: '',
          thought:
            'Analyzing AEGISX security context...',
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
           GEMINI STREAM
        ================================================= */

        const responseStream =
          await ai.models.generateContentStream(
            {
              /*
               * UPDATED MODEL
               *
               * Previous:
               * gemini-2.5-flash
               *
               * Current:
               * gemini-3.6-flash
               */

              model:
                'gemini-3.6-flash',

              contents:
                chatContext,

              config: {
                systemInstruction,

                temperature: 0.7,
              },
            }
          );

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
          'Unknown Gemini API error';

        const errorMsg: ChatMessage =
          {
            id: msgId.current++,
            role: 'ai',

            content: `❌ **Failed to connect to Gemini API**

Error:
${errorMessage}

Please check:

1. Gemini API key
2. Gemini model availability
3. Google AI API access
4. Network connection
5. Browser console for additional details`,

            timestamp:
              new Date().toLocaleTimeString(
                'en-US'
              ),
          };

        setMessages((prev) => [
          ...prev,
          errorMsg,
        ]);

        setIsThinking(false);

        /* Reopen API key input if authentication failed */

        const lowerError =
          errorMessage.toLowerCase();

        if (
          lowerError.includes(
            'api key'
          ) ||
          lowerError.includes(
            'api_key'
          ) ||
          lowerError.includes(
            'unauthorized'
          ) ||
          lowerError.includes(
            'authentication'
          ) ||
          lowerError.includes(
            'permission'
          )
        ) {
          setShowKeyInput(true);

          setGeminiKey('');

          localStorage.removeItem(
            'aegisx_gemini_key'
          );
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

      setInput(
        finalTranscriptRef.current +
          interim
      );
    };

    recognition.onerror = (
      event: any
    ) => {
      if (
        event.error !==
        'no-speech'
      ) {
        console.error(
          'Speech recognition error:',
          event.error
        );
      }
    };

    recognition.onend = () => {
      if (
        isListeningRef.current
      ) {
        try {
          recognition.start();
        } catch (_) {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
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
    } catch (_) {}
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">

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
                AEGISX AI Assistant
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

            {/* Voice */}

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

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="hidden md:block w-px bg-border-color flex-shrink-0 relative z-10" />

        {/* =================================================
            LIVE ACTIVITY FEED
        ================================================= */}

        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col ${
            activePanel === 'chat'
              ? 'hidden md:flex'
              : 'flex'
          } md:flex bg-surface/30 backdrop-blur relative z-10 border-l border-border-color`}
        >

          {/* Header */}

          <div className="px-4 py-3 border-b border-border-color flex items-center justify-between flex-shrink-0">

            <div className="flex items-center gap-2">

              <Activity className="w-4 h-4 text-primary" />

              <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">
                Live Defense Feed
              </span>

            </div>

            <div
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-none border font-mono tracking-widest ${
                defenseMode ===
                'auto'
                  ? 'text-success border-success/30 bg-success/5'
                  : defenseMode ===
                    'suggested'
                  ? 'text-warning border-warning/30 bg-warning/5'
                  : 'text-white/50 border-white/10 bg-surface'
              }`}
            >

              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  defenseMode ===
                  'auto'
                    ? 'bg-success animate-pulse'
                    : defenseMode ===
                      'suggested'
                    ? 'bg-warning animate-pulse'
                    : 'bg-white/30'
                }`}
              />

              {defenseMode ===
              'auto'
                ? 'AUTO'
                : defenseMode ===
                  'suggested'
                ? 'SUGGEST'
                : 'PAUSED'}

            </div>

          </div>

          {/* Status */}

          {defenseMode ===
            'auto' && (
            <div className="mx-3 mt-3 rounded-none border border-success/30 bg-success/5 p-3 flex-shrink-0 cyber-cut">

              <div className="flex items-center gap-2 mb-1">

                <Zap className="w-3.5 h-3.5 text-success" />

                <span className="text-[10px] font-bold text-success tracking-widest font-mono">
                  AUTONOMOUS MONITORING ACTIVE
                </span>

              </div>

              <p className="text-[10px] text-success/70 font-mono mt-2">

                AEGISX is monitoring security events. Recovery actions require user approval.

              </p>

            </div>
          )}

          {/* Feed */}

          <div className="flex-1 overflow-y-auto p-3 space-y-2 mt-2 scrollbar-thin scrollbar-thumb-white/10">

            {activeThreats.length ===
              0 && (
              <div className="text-center p-4 text-white/30 text-xs font-mono">

                No active threats detected.

              </div>
            )}

            {activeThreats.map(
              (item) => (
                <div
                  key={item.id}
                  className="rounded-none bg-surface border border-border-color px-3 py-2.5 hover:border-white/20 transition-colors"
                >

                  <div className="flex items-start gap-2">

                    <span className="text-sm flex-shrink-0 mt-0.5">
                      {ACTIVITY_ICONS[
                        item.type
                      ] || '⚠️'}
                    </span>

                    <div className="min-w-0 flex-1">

                      <div
                        className={`text-xs leading-relaxed font-mono font-medium ${
                          ACTIVITY_COLORS[
                            item.type
                          ] ||
                          'text-white'
                        }`}
                      >
                        {item.message}
                      </div>

                      <div className="flex items-center gap-2 mt-1">

                        <span className="text-[9px] text-white/40 font-mono">
                          {
                            item.timestamp
                          }
                        </span>

                        {item.ticker && (
                          <>
                            <span className="text-white/20">
                              ·
                            </span>

                            <span
                              className={`text-[9px] font-mono ${
                                item.ticker ===
                                'CRITICAL'
                                  ? 'text-danger'
                                  : 'text-warning'
                              }`}
                            >
                              {
                                item.ticker
                              }
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

          {/* =================================================
              AUDIO CONTROLS
          ================================================= */}

          <div className="mx-3 mb-2 rounded-none border border-border-color bg-surface/60 flex-shrink-0 cyber-cut">

            {/* Panel header */}

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border-color">

              <SlidersHorizontal className="w-3 h-3 text-primary" />

              <span className="text-[10px] font-bold text-primary tracking-widest font-mono uppercase">
                Audio Controls
              </span>

              {!audioAvailable && (
                <span className="ml-auto text-[9px] font-mono text-danger/80 tracking-widest uppercase">
                  UNAVAILABLE
                </span>
              )}

            </div>

            <div className="px-3 py-2 space-y-2">

              {/* Audio Alerts toggle */}

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
                  Audio Alerts
                </span>

                <button
                  id="aegisx-audio-alerts-toggle"
                  onClick={() => {
                    unlockAudio();
                    setAudioEnabled(!audioEnabled);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold font-mono tracking-widest uppercase border transition-all cyber-cut ${
                    audioEnabled
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface border-border-color text-white/40 hover:text-white/70'
                  }`}
                >
                  {audioEnabled ? (
                    <><Bell className="w-3 h-3" /> ON</>
                  ) : (
                    <><BellOff className="w-3 h-3" /> OFF</>
                  )}
                </button>

              </div>

              {/* Voice Alerts toggle */}

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
                  Voice Alerts
                </span>

                <button
                  id="aegisx-voice-alerts-toggle"
                  onClick={() => {
                    unlockAudio();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold font-mono tracking-widest uppercase border transition-all cyber-cut ${
                    voiceEnabled
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface border-border-color text-white/40 hover:text-white/70'
                  }`}
                >
                  {voiceEnabled ? (
                    <><Volume2 className="w-3 h-3" /> ON</>
                  ) : (
                    <><VolumeX className="w-3 h-3" /> OFF</>
                  )}
                </button>

              </div>

              {/* Volume slider */}

              <div className="flex items-center gap-2">

                <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase w-12 flex-shrink-0">
                  Volume
                </span>

                <input
                  id="aegisx-alert-volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={alertVolume}
                  onChange={(e) => setAlertVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-primary cursor-pointer"
                />

                <span className="text-[10px] font-mono text-white/40 w-8 text-right">
                  {Math.round(alertVolume * 100)}%
                </span>

              </div>

              {/* Test Alert button */}

              <button
                id="aegisx-test-alert-btn"
                onClick={() => {
                  unlockAudio();
                  playTestAlert();
                }}
                className="w-full py-1.5 rounded-none border border-border-color bg-surface text-[10px] font-bold font-mono tracking-widest uppercase text-white/60 hover:text-primary hover:border-primary/50 transition-all cyber-cut"
              >
                ⚡ Test Alert
              </button>

            </div>

          </div>

          {/* =================================================
              FOOTER STATS
          ================================================= */}

          <div className="p-3 border-t border-border-color flex-shrink-0">

            <div className="grid grid-cols-3 gap-2">

              {[
                {
                  label:
                    'THREATS',
                  value:
                    activeThreats.filter(
                      (item) =>
                        item.type ===
                        'alert'
                    ).length,
                },
                {
                  label:
                    'ACTIONS',
                  value:
                    activeThreats.filter(
                      (item) =>
                        item.type ===
                        'action'
                    ).length,
                },
                {
                  label:
                    'EVENTS',
                  value:
                    activeThreats.length,
                },
              ].map(
                (stat) => (
                  <div
                    key={
                      stat.label
                    }
                    className="text-center rounded-none bg-surface border border-border-color py-2 cyber-cut"
                  >

                    <div className="text-sm font-bold text-white font-mono">
                      {
                        stat.value
                      }
                    </div>

                    <div className="text-[9px] text-white/40 tracking-widest">
                      {
                        stat.label
                      }
                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}