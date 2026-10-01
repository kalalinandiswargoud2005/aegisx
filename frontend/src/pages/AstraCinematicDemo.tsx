import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Shield, AlertTriangle, CheckCircle2, Cpu, Terminal, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Scene {
  start: number;
  end: number;
  title: string;
  tagline: string;
  phase: 'intro' | 'calm' | 'attack' | 'activate' | 'patrol' | 'analysis' | 'remediate' | 'silence' | 'guard' | 'credits';
  image?: string;
  imageAlt?: string;
  panStyle?: string;
  telemetry?: {
    header: string;
    badge: string;
    badgeColor: string;
    items: string[];
  };
  checkpoints?: { text: string; done: boolean }[];
  narration?: string;
}

export function AstraCinematicDemo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ [key: string]: any }>({});

  const DURATION = 60; // 60 seconds

  // Initialize Web Audio Sound Engine
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play procedural sounds based on timeline
  const playSoundBeat = (time: number) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Sub-bass hit at start (0s)
    if (time >= 0 && time < 0.2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    }

    // Threat Alert buzzer (11s)
    if (time >= 11 && time < 11.2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }

    // Motor Whir on Activation (17s - 24s)
    if (time >= 17 && time < 17.2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    }

    // Remediation checkmark confirmation hits (38s, 41s, 43s, 45s, 47s)
    const checkTimes = [38, 41, 43, 45, 47];
    checkTimes.forEach(t => {
      if (Math.abs(time - t) < 0.1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.16); // C6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    });

    // Guard Resolution Chime (53s)
    if (time >= 53 && time < 53.2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 2.5);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= DURATION) {
            setIsPlaying(false);
            return 0;
          }
          const next = +(prev + 0.1).toFixed(1);
          playSoundBeat(next);
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    initAudio();
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    initAudio();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Timeline & Scenes
  const getCurrentScene = (): Scene => {
    if (currentTime < 4) {
      return {
        start: 0,
        end: 4,
        title: 'AIZEN — IV YEAR CYBERSECURITY ALPHA',
        tagline: 'PRESENTS ASTRA: AUTONOMOUS CYBERSECURITY RESPONSE',
        phase: 'intro',
        narration: '',
      };
    } else if (currentTime < 11) {
      return {
        start: 4,
        end: 11,
        title: 'THE CALM BEFORE THE ATTACK',
        tagline: 'Standard Workstation Activity • Rover on Standby Guard',
        phase: 'calm',
        image: '/astra_photos/astra_real_1.jpg',
        imageAlt: 'ASTRA Rover Resting on Desk',
        panStyle: 'scale-105 transition-transform duration-10000 ease-out',
        narration: '“Every attack starts quietly.”',
        telemetry: {
          header: 'WORKSTATION TELEMETRY',
          badge: 'SYSTEM STATUS: NORMAL',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          items: ['CPU Load: 14%', 'Network: Secure LAN', 'EDR Agent: Synced', 'Hardware Rover: Idle Standby'],
        },
      };
    } else if (currentTime < 17) {
      return {
        start: 11,
        end: 17,
        title: 'THREAT DETECTED: ZERO-DAY RANSOMWARE',
        tagline: 'Heuristic Spike Detected • Lateral Spread Imminent',
        phase: 'attack',
        image: '/astra_photos/astra_real_2.jpg',
        imageAlt: 'ASTRA Sensors Detecting Threat',
        panStyle: 'scale-110 -translate-x-2 transition-transform duration-5000',
        narration: '“Suspicious process activity detected. Threat Level: Critical.”',
        telemetry: {
          header: 'SECURITY ALERT: HIGH SEVERITY',
          badge: 'THREAT LEVEL: CRITICAL',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
          items: [
            'PID 4821: svchost_suspicious.exe',
            'File Encryption Rate: 140 files/sec',
            'Shadow Copies: Deletion Attempt',
            'Lateral Probe: Port 445 (SMB) Active',
          ],
        },
      };
    } else if (currentTime < 24) {
      return {
        start: 17,
        end: 24,
        title: 'ASTRA HARDWARE ACTIVATION',
        tagline: 'Cooling Fans High RPM • Motor Torque Engaged • Sensors Active',
        phase: 'activate',
        image: '/astra_photos/astra_real_2.jpg',
        imageAlt: 'ASTRA Twin Fans and Motor Drive',
        panStyle: 'scale-115 translate-y-1 transition-transform duration-7000',
        narration: '“ASTRA detects the anomaly.”',
        telemetry: {
          header: 'ASTRA ROVER ONBOARD TELEMETRY',
          badge: 'AUTONOMOUS RESPONSE: ENABLED',
          badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          items: [
            'Dual 40mm Intake Fans: 5,200 RPM',
            '7-inch Touch HUD: Live Stream',
            'Gear Motors: Torque Engaged',
            'Ransomware Heuristics: 98.7% Confidence',
          ],
        },
      };
    } else if (currentTime < 30) {
      return {
        start: 24,
        end: 30,
        title: 'AUTONOMOUS DESK PATROL & ADVANCE',
        tagline: 'Physically Moving Toward Compromised Host',
        phase: 'patrol',
        image: '/astra_photos/astra_real_3.jpg',
        imageAlt: 'ASTRA Rover Patrol across Tabletop',
        panStyle: 'scale-110 translate-x-4 transition-transform duration-6000',
        narration: '“When the attack starts, ASTRA is already moving.”',
        telemetry: {
          header: 'PHYSICAL RESPONSE VECTOR',
          badge: 'PATROL STATUS: ENGAGED',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          items: [
            'Target: Workstation-01 (192.168.1.104)',
            'Distance: 0.8m -> 0.0m (Docked)',
            'Physical Line of Defense: Established',
            'Hardware Integrity: 100% Operational',
          ],
        },
      };
    } else if (currentTime < 37) {
      return {
        start: 30,
        end: 37,
        title: 'THREAT SIGNATURE ANALYSIS',
        tagline: 'Synthesizing Autonomous Counter-Playbook',
        phase: 'analysis',
        image: '/astra_photos/astra_real_3.jpg',
        imageAlt: 'ASTRA Onboard HUD Threat Synthesis',
        panStyle: 'scale-120 transition-transform duration-7000',
        narration: '“It analyzes the threat. It builds the response.”',
        telemetry: {
          header: 'AI SYNTHESIS ENGINE',
          badge: 'COUNTER-PLAYBOOK READY',
          badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
          items: [
            'Behavior Signature: LockBit Heuristic',
            'Propagation: Multi-Vector SMB/RPC',
            'Remediation Playbook: Generated in 420ms',
            'Confidence Score: 98.7%',
          ],
        },
      };
    } else if (currentTime < 48) {
      return {
        start: 37,
        end: 48,
        title: 'SURGICAL REMEDIATION IN PROGRESS',
        tagline: 'Autonomous Checkpoints Executing Sequentially',
        phase: 'remediate',
        image: '/astra_photos/astra_real_1.jpg',
        imageAlt: 'ASTRA Executing Remediation',
        panStyle: 'scale-105 -translate-y-2 transition-transform duration-11000',
        narration: '“Isolate. Neutralize. Recover.”',
        checkpoints: [
          { text: 'Checkpoint 01: ISOLATING ENDPOINT (Network Traffic Cut)', done: currentTime >= 38 },
          { text: 'Checkpoint 02: TERMINATING MALICIOUS PROCESS (PID 4821 Killed)', done: currentTime >= 41 },
          { text: 'Checkpoint 03: BLOCKING LATERAL MOVEMENT (Ports 445/135 Locked)', done: currentTime >= 43 },
          { text: 'Checkpoint 04: ROLLING BACK COMPROMISED FILES (VSS Snapshot Restored)', done: currentTime >= 45 },
          { text: 'Checkpoint 05: VERIFYING ENDPOINT (System Clean & Verified)', done: currentTime >= 47 },
        ],
      };
    } else if (currentTime < 53) {
      return {
        start: 48,
        end: 53,
        title: 'INCIDENT CONTAINED & RESTORED',
        tagline: 'Autonomous Response Complete • Zero Human Intervention Required',
        phase: 'silence',
        image: '/astra_photos/astra_real_2.jpg',
        imageAlt: 'Clean Workstation and ASTRA',
        panStyle: 'scale-105 transition-transform duration-5000',
        narration: '“Incident contained.”',
        telemetry: {
          header: 'CONTAINMENT REPORT',
          badge: 'SYSTEM CLEAN ✓',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          items: [
            'Response Time: 4.8 Seconds Total',
            'Data Loss: 0 Files Encrypted',
            'Workstation Status: 100% Operational',
            'Autonomous Guard: Active',
          ],
        },
      };
    } else if (currentTime < 57) {
      return {
        start: 53,
        end: 57,
        title: 'HARDWARE-BACKED. AUTONOMOUS. RESILIENT.',
        tagline: 'ASTRA: The Physical Line of Cyber Defense',
        phase: 'guard',
        image: '/astra_photos/astra_real_1.jpg',
        imageAlt: 'Hero Showcase of Real ASTRA Rover',
        panStyle: 'scale-115 transition-transform duration-4000',
        narration: '“Hardware-backed. Autonomous. Resilient.”',
      };
    } else {
      return {
        start: 57,
        end: 60,
        title: 'AIZEN — IV YEAR CYBERSECURITY ALPHA',
        tagline: 'With Special Thanks to Dr. Anand Kumar (Dean — Cybersecurity, IoT & ICE)',
        phase: 'credits',
        narration: '',
      };
    }
  };

  const scene = getCurrentScene();
  const progressPercent = ((currentTime / DURATION) * 100).toFixed(1);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-black text-white flex flex-col justify-between select-none overflow-hidden relative ${
        isFullscreen ? 'p-0' : 'p-4 md:p-8'
      }`}
    >
      {/* Top Bar Header */}
      <header className="z-20 flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-mono text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO SOC</span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              ASTRA CINEMATIC 60S SHOWCASE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Cinematic Video Stage */}
      <main className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl">
        {/* Background Atmosphere & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Real Hardware Image Backdrop (with smooth cinematic pan/zoom) */}
        {scene.image && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={scene.image}
              alt={scene.imageAlt || 'ASTRA Rover Hardware'}
              className={`w-full h-full object-cover object-center opacity-40 mix-blend-screen filter contrast-125 brightness-90 ${
                scene.panStyle || ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
          </div>
        )}

        {/* Scene Content Renderers */}
        <div className="relative z-10 w-full max-w-5xl px-6 md:px-12 py-8 flex flex-col items-center justify-center text-center">
          {/* Phase 1: Intro Title Card */}
          {scene.phase === 'intro' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AIZEN TEAM PRODUCTION</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-sans">
                AIZEN
              </h1>
              <p className="text-sm md:text-lg font-mono tracking-[0.3em] text-cyan-400 font-semibold">
                IV YEAR CYBERSECURITY ALPHA
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto" />
              <p className="text-xs font-mono uppercase text-zinc-500 tracking-widest">Presents</p>
              <h2 className="text-2xl md:text-4xl font-black tracking-widest text-white">ASTRA</h2>
              <p className="text-xs md:text-sm font-mono text-zinc-400 tracking-wider">
                Autonomous Cybersecurity Response
              </p>
            </div>
          )}

          {/* Phase: Calm, Attack, Activate, Patrol, Analysis, Silence */}
          {scene.phase !== 'intro' && scene.phase !== 'credits' && (
            <div className="w-full space-y-6 text-left">
              {/* Scene Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
                    TIMECODE: {currentTime.toFixed(1)}s / {DURATION}.0s
                  </div>
                  <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{scene.title}</h2>
                  <p className="text-xs md:text-sm text-zinc-400 font-mono mt-1">{scene.tagline}</p>
                </div>

                {scene.telemetry && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-bold border self-start md:self-center ${scene.telemetry.badgeColor}`}
                  >
                    {scene.telemetry.badge}
                  </span>
                )}
              </div>

              {/* Main Visual Telemetry & Checkpoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Column: Telemetry Box or Checkpoint List */}
                {scene.telemetry && (
                  <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3 font-mono text-xs shadow-inner">
                    <div className="flex items-center space-x-2 text-zinc-400 font-semibold border-b border-white/10 pb-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>{scene.telemetry.header}</span>
                    </div>
                    <ul className="space-y-2">
                      {scene.telemetry.items.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-zinc-300">
                          <span className="text-cyan-400 font-bold">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scene.checkpoints && (
                  <div className="col-span-1 md:col-span-2 bg-black/75 backdrop-blur-md p-5 rounded-xl border border-white/15 space-y-3 font-mono text-xs shadow-2xl">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold border-b border-white/10 pb-2">
                      <Shield className="w-4 h-4" />
                      <span>AUTONOMOUS SURGICAL CHECKPOINTS (LIVE REMEDIATION)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {scene.checkpoints.map((cp, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                            cp.done
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : 'bg-zinc-900/30 border-white/5 text-zinc-600'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 ${
                              cp.done ? 'text-emerald-400 animate-bounce' : 'text-zinc-700'
                            }`}
                          />
                          <span className="font-semibold">{cp.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Right Column: Physical Hardware Callout */}
                {scene.image && (
                  <div className="bg-zinc-900/40 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                      <Cpu className="w-4 h-4" />
                      <span className="font-bold">PHYSICAL HARDWARE SPECIFICATION</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Authentic ASTRA Rover: Matte Black 3D-printed chassis, 4 yellow high-grip 5-spoke wheels, twin
                      40mm cooling intake fans, brass SMA antenna port, and 7-inch tactical SOC touchscreen.
                    </p>
                  </div>
                )}
              </div>

              {/* Voice-over Narration Bar */}
              {scene.narration && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs md:text-sm font-sans italic text-center">
                  {scene.narration}
                </div>
              )}
            </div>
          )}

          {/* Phase: Final Credits & Acknowledgement */}
          {scene.phase === 'credits' && (
            <div className="space-y-6 animate-fadeIn text-center">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">AIZEN</h2>
              <p className="text-sm md:text-base font-mono tracking-widest text-cyan-400 font-bold">
                IV YEAR CYBERSECURITY ALPHA
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto" />
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase text-zinc-400 tracking-wider">With Special Thanks To</p>
                <p className="text-lg md:text-xl font-bold text-white">Dr. Anand Kumar</p>
                <p className="text-xs md:text-sm text-zinc-400">Dean — Cybersecurity, IoT & ICE</p>
                <p className="text-xs text-zinc-500 font-mono">Malla Reddy University</p>
              </div>
              <p className="text-xs text-zinc-400 italic pt-2">“Thank you for your guidance and support.”</p>
            </div>
          )}
        </div>
      </main>

      {/* Playback Controls & Scrubber */}
      <footer className="z-20 pt-2 space-y-3">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>
              {Math.floor(currentTime / 60)}:{('0' + Math.floor(currentTime % 60)).slice(-2)}
            </span>
            <span className="text-cyan-400 font-semibold">{scene.title}</span>
            <span>1:00</span>
          </div>
          <div
            className="h-2 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = +( (clickX / rect.width) * DURATION ).toFixed(1);
              setCurrentTime(newTime);
              initAudio();
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY 60S SHOWCASE'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
            HARDWARE: REAL ASTRA ROVER • AUDIO: PROCEDURAL SYNTHESIS
          </div>
        </div>
      </footer>
    </div>
  );
}
export default AstraCinematicDemo;
