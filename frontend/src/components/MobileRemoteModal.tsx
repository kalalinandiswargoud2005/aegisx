import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, X, Copy, Check, ExternalLink, Wifi, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

interface MobileRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileRemoteModal({ isOpen, onClose }: MobileRemoteModalProps) {
  const [copied, setCopied] = useState(false);
  const [detectedIp, setDetectedIp] = useState<string>('192.168.1.46');
  const [customIp, setCustomIp] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const currentHost = window.location.hostname;
      if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        setDetectedIp(currentHost);
      } else {
        setDetectedIp('192.168.1.46');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || isHttps);

  let remoteUrl = '';
  if (customIp.trim()) {
    const portPart = window.location.port ? `:${window.location.port}` : (isHttps ? '' : ':5173');
    remoteUrl = `${isHttps ? 'https' : 'http'}://${customIp.trim()}${portPart}/remote`;
  } else if (isVercel) {
    remoteUrl = `${window.location.origin}/remote`;
  } else {
    const portPart = window.location.port ? `:${window.location.port}` : ':5173';
    remoteUrl = `http://${detectedIp}${portPart}/remote`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    toast.success('Mobile Remote URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0e131f] to-[#080b12] border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Smartphone size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-white flex items-center gap-2">
              MOBILE C2 CONTROLLER <Sparkles size={14} className="text-cyan-400" />
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono">Wireless Zero-Touch Attack Demonstration</p>
          </div>
        </div>

        {/* Presentation Tip */}
        <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-gray-300 font-mono flex items-start gap-2">
          <Wifi size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-cyan-300 font-bold">Wi-Fi Connection Notice:</span> Make sure your phone is connected to the same Wi-Fi or phone hotspot as this laptop.
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 my-3">
          <div className="p-3 bg-white rounded-xl shadow-2xl">
            <QRCodeSVG 
              value={remoteUrl} 
              size={180} 
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-[11px] font-mono text-gray-400 mt-3 flex items-center gap-1.5">
            Scan to open <span className="text-cyan-400 font-bold">{remoteUrl}</span>
          </p>
        </div>

        {/* URL Box */}
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 mb-4">
          <input
            type="text"
            readOnly
            value={remoteUrl}
            className="flex-1 bg-transparent text-xs font-mono text-cyan-300 px-2 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3">
          <a
            href={remoteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink size={14} /> Open URL
          </a>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
