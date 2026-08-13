import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Cpu, Activity, Database, Zap, Lock, Server, 
  CheckCircle2, Radio, Terminal, Network, Layers, Globe, 
  Sparkles, RefreshCw, Award, ShieldAlert, Sliders, HardDrive, Check,
  User, UserPlus, Edit2, Trash2, X, Plus, RotateCcw, Mail, Camera, ExternalLink, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, PageContainer, PageHeader, PageSection, Button, Input } from '@/components/ui';

function GithubIcon({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface SystemMetric {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  status: 'optimal' | 'warning' | 'info';
}

interface TechItem {
  name: string;
  version: string;
  category: 'engine' | 'frontend' | 'ai' | 'security';
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  roleTag?: string;
  specialty?: string;
  email?: string;
  github?: string;
  linkedin?: string;
}

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'K. Nandiswar',
    title: 'Software Team Lead & Core Architect (2311cs040073)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE LEAD',
    specialty: 'Core EDR Software Architecture, C2 Backend & Autonomous Remediation Engine',
    email: 'nandiswar.2311cs040073@astra-defense.org',
    github: 'https://github.com/kalalinandiswargoud2005',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-2',
    name: 'G. Nishma',
    title: 'Software Lead & Full Stack Engineer (2311cs040060)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE LEAD',
    specialty: 'Full Stack Dashboard Systems, Real-Time WebSockets & Agent Telemetry',
    email: 'nishma.2311cs040060@astra-defense.org',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-3',
    name: 'D. Kowshik',
    title: 'Hardware Team Lead & Embedded EDR Lead (2311cs040045)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE LEAD',
    specialty: 'Hardware Agent Deployment, USB Target Provisioning & Sensor Appliances',
    email: 'kowshik.2311cs040045@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-4',
    name: 'K. Jyothi',
    title: 'Hardware Lead & IoT Security Specialist (2311cs040076)',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE LEAD',
    specialty: 'Tamper-Resistant Enclaves, Edge Sensor Hardware & IoT Security',
    email: 'jyothi.2311cs040076@astra-defense.org',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-5',
    name: 'A. Rakesh',
    title: 'Software Team — Threat Intelligence Analyst (2311cs040005)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Threat Catalog Research, Zero-Day Heuristics & Incident Analytics',
    email: 'rakesh.2311cs040005@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-6',
    name: 'B. Bhavana',
    title: 'Software Team — UI/UX & Frontend Developer (2311cs040020)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Cyberpunk Glassmorphism UI, Responsive Layouts & Interactive Visuals',
    email: 'bhavana.2311cs040020@astra-defense.org',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-7',
    name: 'B. Sathvika',
    title: 'Software Team — Cloud & DevOps Specialist (2311cs040025)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Vercel & Render CI/CD Deployment Pipelines, Database Pooler & Infrastructure',
    email: 'sathvika.2311cs040025@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-8',
    name: 'B. Navya',
    title: 'Software Team — AI & Behavioral Model Analyst (2311cs040028)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Aegis AI Threat Assistant, Anomaly Detection & Machine Learning',
    email: 'navya.2311cs040028@astra-defense.org',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-9',
    name: 'Ch. HariKrishna',
    title: 'Software Team — Backend & Security Engine Engineer (2311cs040029)',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Spring Boot REST Controllers, Security Handlers & Command Dispatching',
    email: 'harikrishna.2311cs040029@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-10',
    name: 'G. Vaishnav Kumar',
    title: 'Hardware Team — Network & Sensor Hardware Specialist (2311cs040053)',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE TEAM',
    specialty: 'Network Packet Telemetry Hardware, Sensor Controllers & Peripheral Devices',
    email: 'vaishnav.2311cs040053@astra-defense.org',
    github: 'https://github.com'
  }
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
];

const systemMetrics: SystemMetric[] = [
  {
    title: 'Neural NPU Processing Engine',
    value: '64 Cores',
    subtitle: '100% Hardware Acceleration Active',
    icon: Cpu,
    status: 'optimal'
  },
  {
    title: 'Network Packet Line Rate',
    value: '10 Gbps',
    subtitle: '<1.2ms Deep Inspection Latency',
    icon: Activity,
    status: 'optimal'
  },
  {
    title: 'Threat Signature Database',
    value: '4.85M+',
    subtitle: 'Real-time Cyber Indicators Loaded',
    icon: Database,
    status: 'optimal'
  },
  {
    title: 'Hardware Security Module',
    value: 'FIPS 140-3',
    subtitle: 'Post-Quantum Key Enclave Locked',
    icon: Lock,
    status: 'optimal'
  }
];

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Autonomous Threat Mitigation',
    description: 'Sub-millisecond automated packet inspection, inline payload isolation, and zero-day attack neutralization.'
  },
  {
    icon: Cpu,
    title: 'Aegis Neural AI Engine',
    description: 'Context-aware threat correlation and predictive anomaly detection powered by specialized Security LLMs.'
  },
  {
    icon: Network,
    title: 'Multi-Node Edge Telemetry',
    description: 'Continuous monitoring across Windows, Linux, and embedded IoT appliances via lightweight sensor agents.'
  },
  {
    icon: Lock,
    title: 'Quantum-Safe Fabric',
    description: 'Hardware-backed cryptographic security using Kyber1024 and Dilithium algorithms resistant to quantum decryption.'
  }
];

const techStack: TechItem[] = [
  { name: 'React 19 & Vite 8', version: 'v19.2.18', category: 'frontend', description: 'Ultra-fast reactive UI layer' },
  { name: 'TypeScript 6', version: 'v6.0.2', category: 'frontend', description: 'Strict type safety & interface integrity' },
  { name: 'Tailwind CSS v4 & Framer Motion', version: 'v4.3.3', category: 'frontend', description: 'Cyberpunk glassmorphic design system' },
  { name: 'Aegis Security Engine', version: 'v2.1.0-Release', category: 'engine', description: 'High-throughput Rust & C++ core packet processor' },
  { name: 'eBPF Kernel Filters', version: 'v6.8.0-LTS', category: 'engine', description: 'Low-overhead kernel network hook telemetry' },
  { name: 'Aegis Neural Model (Google GenAI)', version: 'v2.16.0', category: 'ai', description: 'Contextual cybersecurity threat assistant' },
  { name: 'Anomaly Classifier Matrix', version: 'v3.4.1', category: 'ai', description: 'Real-time packet behavioral classifier' },
  { name: 'WireGuard Tunneling', version: 'v1.0.2024', category: 'security', description: 'Encrypted peer-to-peer security node mesh' },
  { name: 'PQC Kyber-1024', version: 'NIST Standard', category: 'security', description: 'Post-quantum key encapsulation algorithm' },
  { name: 'TanStack Query', version: 'v5.101', category: 'frontend', description: 'Real-time WebSocket & REST state synchronization' },
  { name: 'Recharts Engine', version: 'v3.10.1', category: 'frontend', description: 'High-frequency visual telemetry charts' },
  { name: 'FIPS Cryptographic Module', version: 'Level 3', category: 'security', description: 'Hardware tamper-resistant key store' }
];

const architectureSteps = [
  { step: '01', title: 'Telemetry Ingestion', desc: 'Edge sensor agents gather network flows, process metrics, and kernel events.', icon: Radio },
  { step: '02', title: 'Kernel eBPF Inspection', desc: 'High-speed packet filtration occurs directly inside the network stack.', icon: Layers },
  { step: '03', title: 'Aegis AI Threat Analysis', desc: 'Neural engines analyze payload features for zero-day exploit patterns.', icon: Sparkles },
  { step: '04', title: 'Automated Enforcement', desc: 'Instant packet drop, process isolation, and SOC incident dispatching.', icon: ShieldAlert }
];

const certifications = [
  { code: 'ISO/IEC 27001:2022', title: 'Information Security Management System', issuer: 'Certified Compliance' },
  { code: 'NIST CSF 2.0', title: 'Cybersecurity Framework Alignment', issuer: 'Tier 4 Adaptive' },
  { code: 'SOC 2 Type II', title: 'Security, Availability & Confidentiality', issuer: 'Independently Audited' },
  { code: 'FIPS 140-3 Level 3', title: 'Security Requirements for Cryptographic Modules', issuer: 'Validated Enclave' }
];

export function About() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'engine' | 'frontend' | 'ai' | 'security'>('all');
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  // Team Members State with localStorage persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('astra_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((m: any) => m.name && m.name.includes('Nandiswar'))) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved team members', e);
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    title: '',
    photoUrl: '',
    roleTag: '',
    specialty: '',
    email: '',
    github: '',
    linkedin: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        toast.success('Custom avatar photo loaded from computer');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('astra_team_members', JSON.stringify(teamMembers));
    } catch (e) {
      console.error('Failed to save team members to localStorage', e);
    }
  }, [teamMembers]);

  const filteredTech = activeCategory === 'all' 
    ? techStack 
    : techStack.filter(t => t.category === activeCategory);

  const runDiagnostics = () => {
    if (isRunningDiagnostics) return;
    setIsRunningDiagnostics(true);
    setDiagnosticProgress(0);

    toast.info('Initiating ASTRA Appliance Diagnostics...');

    const interval = setInterval(() => {
      setDiagnosticProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningDiagnostics(false);
          toast.success('ASTRA System Diagnostics Complete: All 12 Subsystems Nominal (100% Integrity)');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Team Member Modal Handlers
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      title: '',
      photoUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      roleTag: 'SECURITY CORE',
      specialty: 'Cybersecurity Architecture & Defense',
      email: '',
      github: '',
      linkedin: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.title?.trim()) {
      toast.error('Please fill in both Name and Title.');
      return;
    }

    const photo = formData.photoUrl?.trim() || PRESET_AVATARS[0];

    if (editingMember) {
      // Update existing
      setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? {
        ...m,
        ...formData,
        photoUrl: photo,
        name: formData.name!.trim(),
        title: formData.title!.trim()
      } as TeamMember : m));
      toast.success(`Updated details for ${formData.name}`);
    } else {
      // Create new
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: formData.name.trim(),
        title: formData.title.trim(),
        photoUrl: photo,
        roleTag: formData.roleTag?.trim() || 'SECURITY MEMBER',
        specialty: formData.specialty?.trim() || 'Cybersecurity Engineering',
        email: formData.email?.trim() || '',
        github: formData.github?.trim() || '',
        linkedin: formData.linkedin?.trim() || ''
      };
      setTeamMembers(prev => [...prev, newMember]);
      toast.success(`Added ${newMember.name} to ASTRA Team`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    toast.info(`Removed ${name} from Team Members`);
  };

  const handleResetTeam = () => {
    setTeamMembers(DEFAULT_TEAM_MEMBERS);
    localStorage.removeItem('astra_team_members');
    toast.success('Reset team members to default roster.');
  };

  return (
    <PageContainer className="space-y-8 pb-12">
      <PageHeader 
        title="About ASTRA Enterprise" 
        description="System architecture, core engine specifications, tech stack breakdown, and licensing."
      />

      {/* PROMINENT BIG-SIZE EDITABLE TEAM MEMBERS SECTION (AT THE VERY TOP) */}
      <PageSection className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/30 shadow-[0_0_25px_rgba(5,217,232,0.15)]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(5,217,232,0.3)]">
              <User size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-space font-bold text-white tracking-wide">ASTRA Engineering Leadership</h2>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 font-mono text-xs">
                  CORE ROSTER
                </Badge>
              </div>
              <p className="text-sm text-white/70">
                Architects, AI Researchers & Core Developers powering the appliance. Click edit or add to modify roster.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleOpenAddModal}
              variant="primary"
              size="md"
              className="flex items-center gap-2 text-black font-bold shadow-[0_0_20px_rgba(5,217,232,0.4)]"
            >
              <UserPlus size={16} />
              Add Member
            </Button>
            <Button
              onClick={handleResetTeam}
              variant="outline"
              size="md"
              className="flex items-center gap-2 border-white/20 text-white/80 hover:text-white hover:border-primary"
              title="Reset Team Roster to Default"
            >
              <RotateCcw size={16} />
              Reset Roster
            </Button>
          </div>
        </div>

        {/* BIG SIZE TEAM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="relative group overflow-hidden border-white/15 hover:border-primary/60 bg-gradient-to-b from-surface/80 via-surface/60 to-surface/90 hover:from-surface hover:to-primary/10 transition-all duration-500 flex flex-col justify-between h-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(5,217,232,0.3)]">
                  {/* Action Controls overlay */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-2 rounded-xl bg-surface/90 text-primary hover:bg-primary hover:text-black border border-primary/40 transition-all shadow-md"
                      title="Edit Member Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id, member.name)}
                      className="p-2 rounded-xl bg-surface/90 text-danger hover:bg-danger hover:text-white border border-danger/40 transition-all shadow-md"
                      title="Delete Team Member"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Photo Avatar in Big Size */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-primary/40 group-hover:border-primary shadow-[0_0_25px_rgba(5,217,232,0.25)] group-hover:shadow-[0_0_35px_rgba(5,217,232,0.6)] transition-all duration-500">
                          <img 
                            src={member.photoUrl} 
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                            }}
                          />
                        </div>
                        {member.roleTag && (
                          <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono bg-primary text-black font-bold uppercase tracking-wider px-3 py-1 whitespace-nowrap shadow-lg border border-primary/50">
                            {member.roleTag}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-space font-bold text-white group-hover:text-primary transition-colors mt-2 tracking-wide">
                        {member.name}
                      </h3>
                      <p className="text-sm font-mono text-primary font-semibold mt-1">
                        {member.title}
                      </p>
                    </div>

                    {member.specialty && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs sm:text-sm text-white/70 text-center line-clamp-3 italic leading-relaxed">
                          "{member.specialty}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Social / Contact Links Footer */}
                  <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-center gap-4">
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-white/60 hover:text-primary hover:scale-125 transition-all p-1.5 rounded-lg hover:bg-primary/10"
                        title={member.email}
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {member.github && (
                      <a 
                        href={member.github} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-white/60 hover:text-primary hover:scale-125 transition-all p-1.5 rounded-lg hover:bg-primary/10"
                        title="GitHub Profile"
                      >
                        <GithubIcon size={18} />
                      </a>
                    )}
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-white/60 hover:text-primary hover:scale-125 transition-all p-1.5 rounded-lg hover:bg-primary/10"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon size={18} />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </PageSection>

      {/* Hero Banner Card */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-surface via-surface/90 to-primary/10 shadow-[0_0_30px_rgba(5,217,232,0.15)]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck size={260} className="text-primary" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-2">
          <div className="flex items-center gap-5">
            <motion.div 
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/40 shadow-[0_0_20px_rgba(5,217,232,0.4)]"
              animate={{ boxShadow: ['0 0 15px rgba(5,217,232,0.3)', '0 0 30px rgba(5,217,232,0.7)', '0 0 15px rgba(5,217,232,0.3)'] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <ShieldCheck size={44} />
            </motion.div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-space font-bold text-white tracking-wide">ASTRA Enterprise</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 font-mono text-xs">
                  v1.0.0-rc.4
                </Badge>
              </div>
              <p className="text-base text-white/70">
                AI-Powered Embedded Cybersecurity Security Appliance & Autonomous Threat Defense Platform
              </p>
              
              <div className="flex items-center gap-4 mt-3 text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  System Status: <strong className="text-emerald-400 font-semibold">OPERATIONAL</strong>
                </span>
                <span className="text-white/30">|</span>
                <span>Core Engine: <strong className="text-white font-semibold">v2.1.0-AegisAI</strong></span>
                <span className="text-white/30">|</span>
                <span>Uptime: <strong className="text-white font-semibold">99.998%</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunningDiagnostics}
              className="relative overflow-hidden bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-mono text-sm py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(5,217,232,0.2)]"
            >
              <RefreshCw size={16} className={isRunningDiagnostics ? 'animate-spin' : ''} />
              {isRunningDiagnostics ? `Testing (${diagnosticProgress}%)` : 'Run Diagnostics'}
            </Button>
          </div>
        </div>

        {/* Progress Bar overlay when running diagnostics */}
        <AnimatePresence>
          {isRunningDiagnostics && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '4px' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-surface-light mt-4 rounded-full overflow-hidden"
            >
              <motion.div 
                className="h-full bg-primary shadow-[0_0_10px_#05d9e8]"
                style={{ width: `${diagnosticProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Hardware & System Specs Grid */}
      <PageSection className="space-y-4">
        <div>
          <h2 className="text-xl font-space font-semibold text-white">Hardware Node & Engine Metrics</h2>
          <p className="text-xs text-white/60">Live hardware acceleration and signature capacity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric, i) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-5 border-white/10 hover:border-primary/40 transition-all duration-300 group hover:shadow-[0_4px_20px_rgba(5,217,232,0.15)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-white/50 tracking-wider uppercase">{metric.title}</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <IconComponent size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-space font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {metric.value}
                  </div>
                  <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {metric.subtitle}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </PageSection>

      {/* Core Architectural Pillars */}
      <PageSection className="space-y-4">
        <div>
          <h2 className="text-xl font-space font-semibold text-white">Core Defense Pillars</h2>
          <p className="text-xs text-white/60">Built for enterprise threat detection and autonomous remediation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-white/10 hover:border-primary/40 bg-surface/40 hover:bg-surface/70 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/15 text-primary border border-primary/30 shrink-0">
                      <Icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-space font-semibold text-white">{pillar.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </PageSection>

      {/* End-to-End Data Pipeline Visual */}
      <PageSection className="space-y-4">
        <div>
          <h2 className="text-xl font-space font-semibold text-white">System Architecture & Threat Pipeline</h2>
          <p className="text-xs text-white/60">Real-time flow from packet tap to automated mitigation.</p>
        </div>
        <Card className="p-6 border-white/10 bg-surface/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {architectureSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.step} className="relative group">
                  <div className="p-5 rounded-xl border border-white/10 bg-surface-light/40 group-hover:border-primary/50 group-hover:bg-surface-light/80 transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        STEP {step.step}
                      </span>
                      <StepIcon size={20} className="text-primary/70 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-space font-semibold text-white text-base mb-1.5">{step.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </PageSection>

      {/* Technology Stack Matrix */}
      <PageSection className="space-y-4">
        <div>
          <h2 className="text-xl font-space font-semibold text-white">Technology Stack & Subsystems</h2>
          <p className="text-xs text-white/60">Modern components powering the ASTRA platform.</p>
        </div>
        <Card className="p-6 border-white/10">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
            {[
              { id: 'all', label: 'All Technologies' },
              { id: 'engine', label: 'Security Engine' },
              { id: 'frontend', label: 'Frontend & UI' },
              { id: 'ai', label: 'AI & Intelligence' },
              { id: 'security', label: 'Cryptography & Mesh' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-black font-semibold shadow-[0_0_12px_rgba(5,217,232,0.5)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Tech Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTech.map((item) => (
              <motion.div 
                key={item.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-lg border border-white/5 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-space font-medium text-sm text-white">{item.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-white/80">
                      {item.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </PageSection>


      {/* EDIT & ADD TEAM MEMBER MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/40 bg-surface p-6 shadow-[0_0_50px_rgba(5,217,232,0.25)]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-primary" size={20} />
                  <h3 className="text-lg font-space font-bold text-white">
                    {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveTeamMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Full Name *</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Title / Role *</label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Security Engineer"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-white/70">Role Badge</label>
                    <Input
                      value={formData.roleTag || ''}
                      onChange={(e) => setFormData({ ...formData, roleTag: e.target.value.toUpperCase() })}
                      placeholder="e.g. ARCHITECT"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-white/70">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@astra-defense.org"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/70 flex items-center justify-between">
                    <span>Photo Avatar Image *</span>
                    <span className="text-[10px] text-primary font-mono font-semibold">Upload from PC or enter URL</span>
                  </label>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer p-4 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                      isDragging 
                        ? 'border-primary bg-primary/20 scale-[1.02] shadow-[0_0_20px_rgba(5,217,232,0.4)]' 
                        : 'border-white/20 bg-surface-light/30 hover:border-primary/50 hover:bg-surface-light/60'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {formData.photoUrl ? (
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/50 shrink-0 shadow-md">
                          <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <Check size={14} /> Image Selected
                          </p>
                          <p className="text-[11px] text-white/60 truncate mt-0.5">
                            {formData.photoUrl.startsWith('data:') ? 'Custom file from computer' : formData.photoUrl}
                          </p>
                          <span className="text-[10px] text-primary hover:underline mt-1 block">
                            Click or drag another image file to replace
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                          <Upload size={20} />
                        </div>
                        <p className="text-xs font-medium text-white">
                          Drag & drop photo here, or <span className="text-primary font-semibold underline">Browse Computer</span>
                        </p>
                        <p className="text-[10px] text-white/50 mt-0.5">PNG, JPG, WEBP, GIF up to 8MB</p>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-1">
                    <Input
                      value={formData.photoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                    />
                  </div>

                  {/* Preset Avatar Selection */}
                  <div className="pt-1">
                    <span className="text-[11px] text-white/50 block mb-1.5">Or choose a preset avatar:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setFormData({ ...formData, photoUrl: url })}
                          className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                            formData.photoUrl === url ? 'border-primary scale-110 shadow-[0_0_10px_#05d9e8]' : 'border-white/20 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Specialty / Short Bio</label>
                  <textarea
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. Zero-trust networking and threat detection models..."
                    rows={2}
                    className="flex w-full rounded-md border border-border-color bg-surface/50 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-white/70">GitHub URL</label>
                    <Input
                      value={formData.github || ''}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-white/70">LinkedIn URL</label>
                    <Input
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-white/60 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2 text-black font-bold"
                  >
                    <Check size={16} />
                    {editingMember ? 'Save Changes' : 'Add Team Member'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compliance & Licensing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <Award className="text-primary" size={24} />
            <div>
              <h3 className="text-lg font-space font-semibold text-white">Enterprise Security & Compliance</h3>
              <p className="text-xs text-white/60">Validated security controls and framework standard alignments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {certifications.map((cert) => (
              <div key={cert.code} className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-3">
                <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono font-bold text-primary">{cert.code}</div>
                  <div className="text-xs font-medium text-white">{cert.title}</div>
                  <div className="text-[10px] text-white/50">{cert.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-white">
              <Lock size={20} className="text-primary" />
              <h3 className="text-lg font-space font-semibold">License & Notice</h3>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-xs mb-3">
              Proprietary Enterprise Software
            </Badge>
            <p className="text-xs text-white/70 leading-relaxed">
              ASTRA Cybersecurity Enterprise Appliance is licensed exclusively for authorized organization deployments. 
              Unauthorized reverse engineering, disassembly, or distribution of core engine binaries is strictly prohibited.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-white/40 font-mono flex items-center justify-between">
            <span>© 2026 ASTRA Security Inc.</span>
            <span>All Rights Reserved</span>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

