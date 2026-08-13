import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Usb, HardDrive, RefreshCw, Zap, CheckCircle2, AlertTriangle, X, Laptop, Terminal, Server, ShieldCheck } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UsbDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UsbDrive {
  driveLetter: string;
  displayName: string;
  totalSpaceBytes: number;
  freeSpaceBytes: number;
  removable: boolean;
}

export function UsbDeployModal({ isOpen, onClose }: UsbDeployModalProps) {
  const [drives, setDrives] = useState<UsbDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('Target-Laptop-01');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [hostIp, setHostIp] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [deployResult, setDeployResult] = useState<any>(null);

  const fetchDrives = async () => {
    setIsScanning(true);
    try {
      const res = await api.get('/usb/drives');
      const data = res.data;
      setDrives(data.drives || []);
      setHostIp(data.hostIp || '127.0.0.1');
      if (!serverUrl) {
        setServerUrl(data.defaultServerUrl || `http://${data.hostIp}:8080`);
      }
      
      // Auto-select first removable drive or fallback to first drive
      const removable = (data.drives || []).find((d: UsbDrive) => d.removable);
      if (removable) {
        setSelectedDrive(removable.driveLetter);
      } else if (data.drives && data.drives.length > 0) {
        setSelectedDrive(data.drives[0].driveLetter);
      }
    } catch (err) {
      toast.error('Failed to scan USB drives from backend');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDeployResult(null);
      setProgress(0);
      fetchDrives();
    }
  }, [isOpen]);

  const handleDeploy = async () => {
    if (!selectedDrive) {
      toast.error('Please select a target USB drive or laptop drive');
      return;
    }

    setIsDeploying(true);
    setProgress(15);

    try {
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const res = await api.post('/usb/deploy', {
        drivePath: selectedDrive,
        targetHostname: targetName,
        serverUrl: serverUrl
      });

      clearInterval(timer);
      setProgress(100);
      setDeployResult(res.data);
      toast.success('Agent Package Flashed to USB!', {
        description: `Staged installer ready on drive ${selectedDrive}`
      });
    } catch (err: any) {
      toast.error('USB Agent Deployment Failed', {
        description: err.response?.data?.message || 'Writing to USB failed.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#020617] border border-primary/50 p-6 font-mono shadow-[0_0_40px_rgba(0,240,255,0.25)] relative text-white rounded-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/30 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/40 cyber-cut">
              <Usb size={22} className="text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="font-rajdhani font-bold text-xl tracking-wider text-white flex items-center gap-2">
                USB TARGET AGENT DEPLOYMENT
              </h2>
              <p className="text-xs text-white/50">
                Stage one-click Astra EDR agent payload directly onto connected USB hardware.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {!deployResult ? (
          <div className="space-y-5">
            {/* USB Drive Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <HardDrive size={14} /> Connected USB Storage / Target Drives
                </label>
                <button
                  onClick={fetchDrives}
                  disabled={isScanning}
                  className="text-xs text-secondary hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                  <span>Scan Hardware</span>
                </button>
              </div>

              {isScanning ? (
                <div className="p-4 bg-surface border border-border-color text-center text-white/50 text-xs animate-pulse">
                  Scanning system for USB hardware connections...
                </div>
              ) : drives.length === 0 ? (
                <div className="p-4 bg-danger/10 border border-danger/40 text-danger text-xs flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>No USB drives detected. Connect target laptop USB drive and click Scan Hardware.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {drives.map((drive) => (
                    <div
                      key={drive.driveLetter}
                      onClick={() => setSelectedDrive(drive.driveLetter)}
                      className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
                        selectedDrive === drive.driveLetter
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'border-border-color bg-surface hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Usb size={18} className={drive.removable ? 'text-success' : 'text-primary'} />
                        <div>
                          <span className="font-bold text-sm text-white">{drive.displayName}</span>
                          <div className="text-[11px] text-white/50">
                            {drive.driveLetter} ({(drive.freeSpaceBytes / (1024 * 1024 * 1024)).toFixed(1)} GB Free)
                          </div>
                        </div>
                      </div>
                      {drive.removable && (
                        <span className="text-[10px] bg-success/20 text-success border border-success/40 px-1.5 py-0.5 font-bold uppercase">
                          USB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Laptop Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1 flex items-center gap-1.5">
                  <Laptop size={14} className="text-secondary" /> Target Device Hostname
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Target-Laptop-01"
                  className="w-full bg-surface border border-border-color px-3 py-2 text-sm text-white focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1 flex items-center gap-1.5">
                  <Server size={14} className="text-primary" /> C2 Server URL
                </label>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder={`http://${hostIp}:8080`}
                  className="w-full bg-surface border border-border-color px-3 py-2 text-sm text-white focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {isDeploying && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-primary font-bold">
                  <span>FLASHING AGENT PAYLOAD TO USB...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface border border-border-color overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-success"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-color">
              <Button variant="outline" onClick={onClose} disabled={isDeploying}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeploy}
                disabled={isDeploying || !selectedDrive}
                className="flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <Zap size={16} />
                {isDeploying ? 'Flashing USB...' : 'Deploy Agent to USB Laptop'}
              </Button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-5">
            <div className="p-4 bg-success/10 border border-success/50 flex items-start gap-3">
              <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-success text-base uppercase">
                  USB PROVISIONING KIT CREATED SUCCESSFULLY!
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  {deployResult.message}
                </p>
              </div>
            </div>

            <div className="bg-surface border border-border-color p-4 space-y-2">
              <div className="text-xs font-bold uppercase text-primary flex items-center gap-1.5">
                <Terminal size={14} /> Next Steps for Targeted Laptop:
              </div>
              <ol className="list-decimal list-inside text-xs text-white/80 space-y-1.5 pl-1">
                <li>Plug the USB drive into the targeted laptop.</li>
                <li>Open the <span className="text-secondary font-bold">ASTRA_AGENT_INSTALLER</span> folder on the USB.</li>
                <li>Right-click <span className="text-success font-bold">Deploy-Target-Agent.bat</span> and select <span className="text-warning font-bold">"Run as Administrator"</span>.</li>
                <li>The agent will register automatically with this C2 dashboard ({serverUrl}).</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={onClose} className="flex items-center gap-2">
                <ShieldCheck size={16} /> Done & Return to Devices
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
