import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, User, UserPlus, Edit2, Trash2, X, RotateCcw, Mail, Upload 
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
    id: 'team-5',
    name: 'A. Rakesh',
    title: 'Threat Intelligence & Security Analyst (2311cs040005)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Threat Catalog Research, Zero-Day Heuristics & Incident Analytics',
    email: 'rakesh.2311cs040005@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-6',
    name: 'B. Bhavana',
    title: 'UI/UX & Frontend Developer (2311cs040020)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Cyberpunk Glassmorphism UI, Responsive Layouts & Interactive Visuals',
    email: 'bhavana.2311cs040020@astra-defense.org',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-7',
    name: 'B. Sathvika',
    title: 'Cloud Infrastructure & DevOps Engineer (2311cs040025)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Vercel & Render CI/CD Deployment Pipelines, Database Pooler & Infrastructure',
    email: 'sathvika.2311cs040025@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-8',
    name: 'B. Navya',
    title: 'AI & Behavioral Threat Model Analyst (2311cs040028)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Aegis AI Threat Assistant, Anomaly Detection & Machine Learning',
    email: 'navya.2311cs040028@astra-defense.org',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-9',
    name: 'Ch. HariKrishna',
    title: 'Backend & C2 Security Engine Engineer (2311cs040029)',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Spring Boot REST Controllers, Security Handlers & Command Dispatching',
    email: 'harikrishna.2311cs040029@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-3',
    name: 'D. Kowshik',
    title: 'Embedded EDR & Hardware Agent Specialist (2311cs040045)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE TEAM',
    specialty: 'Hardware Agent Deployment, USB Target Provisioning & Sensor Appliances',
    email: 'kowshik.2311cs040045@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-10',
    name: 'G. Vaishnav Kumar',
    title: 'Network Packet Telemetry & Hardware Specialist (2311cs040053)',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE TEAM',
    specialty: 'Network Packet Telemetry Hardware, Sensor Controllers & Peripheral Devices',
    email: 'vaishnav.2311cs040053@astra-defense.org',
    github: 'https://github.com'
  },
  {
    id: 'team-2',
    name: 'G. Nishma',
    title: 'Full Stack Engineer & WebSockets Developer (2311cs040060)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Full Stack Dashboard Systems, Real-Time WebSockets & Agent Telemetry',
    email: 'nishma.2311cs040060@astra-defense.org',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-1',
    name: 'K. Nandeeshwar',
    title: 'Core Software Architect & Security Engine Developer (2311cs040073)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    roleTag: 'SOFTWARE TEAM',
    specialty: 'Core EDR Software Architecture, C2 Backend & Autonomous Remediation Engine',
    email: 'nandiswar.2311cs040073@astra-defense.org',
    github: 'https://github.com/kalalinandiswargoud2005',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'team-4',
    name: 'K. Jyothi',
    title: 'IoT Security & Hardware Sensor Engineer (2311cs040076)',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    roleTag: 'HARDWARE TEAM',
    specialty: 'Tamper-Resistant Enclaves, Edge Sensor Hardware & IoT Security',
    email: 'jyothi.2311cs040076@astra-defense.org',
    linkedin: 'https://linkedin.com'
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

export function About() {
  // IndexedDB Storage Helpers for infinite storage capacity & zero quota errors
  const IDB_STORE_KEY = 'astra_team_members_roster';

  const saveToIndexedDB = (members: TeamMember[]): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('AstraTeamDB', 1);
        request.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('roster')) {
            db.createObjectStore('roster');
          }
        };
        request.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction('roster', 'readwrite');
          const store = tx.objectStore('roster');
          store.put(members, IDB_STORE_KEY);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        };
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  };

  const loadFromIndexedDB = (): Promise<TeamMember[] | null> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('AstraTeamDB', 1);
        request.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('roster')) {
            db.createObjectStore('roster');
          }
        };
        request.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction('roster', 'readonly');
          const store = tx.objectStore('roster');
          const getReq = store.get(IDB_STORE_KEY);
          getReq.onsuccess = () => {
            if (Array.isArray(getReq.result) && getReq.result.length > 0) {
              resolve(getReq.result);
            } else {
              resolve(null);
            }
          };
          getReq.onerror = () => resolve(null);
        };
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  };

  // Helper to compress and resize images so they fit in browser storage easily
  const compressAndResizeImage = (dataUrl: string, maxWidth: number = 360, maxHeight: number = 360): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || typeof dataUrl !== 'string') {
        resolve(dataUrl);
        return;
      }
      
      // If it's a short URL (not data:), return immediately
      if (!dataUrl.startsWith('data:') && dataUrl.length < 500) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      // CRITICAL: Do NOT set crossOrigin for data: URLs because Chrome/Edge blocks CORS on data URIs
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          let width = img.width || 360;
          let height = img.height || 360;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressed);
          } else {
            resolve(dataUrl);
          }
        } catch (e) {
          console.warn('Canvas compression error, using raw URL', e);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    });
  };

  // Team Members State with Synchronous LocalStorage & Async IndexedDB persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('astra_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved team members', e);
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  // Load from IndexedDB asynchronously on mount to restore any saved custom images
  useEffect(() => {
    loadFromIndexedDB().then((idbMembers) => {
      if (idbMembers && idbMembers.length > 0) {
        setTeamMembers(idbMembers);
      }
    });
  }, []);

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
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds 20MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.result) {
        const rawResult = reader.result as string;
        const optimizedImage = await compressAndResizeImage(rawResult, 360, 360);
        setFormData(prev => ({ ...prev, photoUrl: optimizedImage }));
        toast.success('Custom avatar photo loaded and optimized');
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

  // Sync to both LocalStorage & IndexedDB whenever teamMembers state updates
  useEffect(() => {
    try {
      localStorage.setItem('astra_team_members', JSON.stringify(teamMembers));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, saving to IndexedDB store', e);
    }
    saveToIndexedDB(teamMembers);
  }, [teamMembers]);

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

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.title?.trim()) {
      toast.error('Please fill in both Name and Title.');
      return;
    }

    const rawPhoto = formData.photoUrl?.trim() || PRESET_AVATARS[0];
    const photo = await compressAndResizeImage(rawPhoto, 360, 360);

    let updatedMembers: TeamMember[];
    if (editingMember) {
      // Update existing
      updatedMembers = teamMembers.map(m => m.id === editingMember.id ? {
        ...m,
        ...formData,
        photoUrl: photo,
        name: formData.name!.trim(),
        title: formData.title!.trim()
      } as TeamMember : m);
    } else {
      // Create new
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: formData.name!.trim(),
        title: formData.title!.trim(),
        photoUrl: photo,
        roleTag: formData.roleTag?.trim() || 'SECURITY MEMBER',
        specialty: formData.specialty?.trim() || 'Cybersecurity Engineering',
        email: formData.email?.trim() || '',
        github: formData.github?.trim() || '',
        linkedin: formData.linkedin?.trim() || ''
      };
      updatedMembers = [...teamMembers, newMember];
    }

    // Immediately persist to state, IndexedDB and LocalStorage
    setTeamMembers(updatedMembers);
    saveToIndexedDB(updatedMembers);
    try {
      localStorage.setItem('astra_team_members', JSON.stringify(updatedMembers));
    } catch (e) {
      console.warn('LocalStorage save error, fallback to IndexedDB active', e);
    }

    toast.success(editingMember ? `Updated details for ${formData.name}` : `Added ${formData.name} to ASTRA Team`);
    setIsModalOpen(false);
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    saveToIndexedDB(updated);
    try {
      localStorage.setItem('astra_team_members', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete sync warning', e);
    }
    toast.info(`Removed ${name} from Team Members`);
  };

  const handleResetTeam = () => {
    setTeamMembers(DEFAULT_TEAM_MEMBERS);
    localStorage.removeItem('astra_team_members');
    saveToIndexedDB(DEFAULT_TEAM_MEMBERS);
    toast.success('Reset team members to default roster.');
  };

  return (
    <PageContainer className="space-y-8 pb-12">
      <PageHeader 
        title="About ASTRA Enterprise" 
        description="Engineering Team Roster and Project Contributors."
      />

      {/* TEAM MEMBERS SECTION */}
      <PageSection className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/30 shadow-[0_0_25px_rgba(5,217,232,0.15)]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(5,217,232,0.3)]">
              <User size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-space font-bold text-white tracking-wide">ASTRA Engineering Team Roster</h2>
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

        {/* TEAM CARDS GRID */}
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

      {/* EDIT & ADD TEAM MEMBER MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-primary/40 bg-surface p-4 sm:p-5 shadow-[0_0_40px_rgba(5,217,232,0.3)] text-white font-mono"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-primary" size={18} />
                  <h3 className="text-base font-space font-bold text-white">
                    {editingMember ? 'Edit Member' : 'Add Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveTeamMember} className="space-y-3">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-mono text-white/70">Full Name *</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. K. Nandeeshwar"
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-mono text-white/70">Title / Role *</label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Core Software Architect"
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-mono text-white/70">Role Badge</label>
                    <Input
                      value={formData.roleTag || ''}
                      onChange={(e) => setFormData({ ...formData, roleTag: e.target.value.toUpperCase() })}
                      placeholder="e.g. SOFTWARE TEAM"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-mono text-white/70">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nandiswar@astra-defense.org"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 flex items-center justify-between">
                    <span>Photo Avatar</span>
                    <span className="text-[9px] text-primary">Upload file or pick avatar</span>
                  </label>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer p-2 rounded-lg border border-dashed transition-all flex flex-col items-center justify-center gap-1 ${
                      isDragging 
                        ? 'border-primary bg-primary/20 scale-[1.01]' 
                        : 'border-white/20 bg-surface-light/30 hover:border-primary/50'
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
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/50 shrink-0">
                          <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <Check size={12} /> Image Ready
                          </p>
                          <span className="text-[9px] text-primary hover:underline block truncate">
                            Click to replace photo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1 flex items-center gap-2">
                        <Upload size={14} className="text-primary" />
                        <span className="text-[11px] text-white/80">Click or drag image file</span>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-0.5">
                    <Input
                      value={formData.photoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                      className="h-7 text-[11px]"
                    />
                  </div>

                  {/* Preset Avatar Selection */}
                  <div className="pt-0.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setFormData({ ...formData, photoUrl: url })}
                          className={`w-7 h-7 rounded-md overflow-hidden shrink-0 border transition-all ${
                            formData.photoUrl === url ? 'border-primary scale-105 shadow-[0_0_8px_#05d9e8]' : 'border-white/20 opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[11px] font-mono text-white/70">Specialty / Short Bio</label>
                  <textarea
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. Core EDR Software Architecture & C2 Backend..."
                    rows={2}
                    className="flex w-full rounded-md border border-border-color bg-surface/50 px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-mono text-white/70">GitHub URL</label>
                    <Input
                      value={formData.github || ''}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/..."
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[11px] font-mono text-white/70">LinkedIn URL</label>
                    <Input
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/..."
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-white/60 hover:text-white font-mono text-xs uppercase h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 font-mono font-bold text-xs uppercase text-black bg-primary hover:bg-cyan-300 shadow-[0_0_15px_rgba(5,217,232,0.4)] px-4 h-8 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>{editingMember ? 'SAVE' : 'SAVE MEMBER'}</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
