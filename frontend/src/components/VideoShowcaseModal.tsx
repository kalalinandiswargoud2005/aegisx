import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function triggerVideoShowcase() {
  window.dispatchEvent(new CustomEvent('open-video-showcase'));
}

interface VideoShowcaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function VideoShowcaseModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  isStandalonePage = false,
}: VideoShowcaseModalProps) {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const videoSrc = '/video-64793.mp4';

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    if (isStandalonePage) {
      navigate(-1);
    }
  };

  // Listen to global open event
  useEffect(() => {
    if (controlledIsOpen !== undefined) return;
    const handleOpen = () => {
      setInternalIsOpen(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('open-video-showcase', handleOpen);
    return () => window.removeEventListener('open-video-showcase', handleOpen);
  }, [controlledIsOpen]);

  // Handle ESC or Backspace key to close
  useEffect(() => {
    if (!isOpen && !isStandalonePage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isStandalonePage]);

  // Auto-play when opened
  useEffect(() => {
    if (isOpen || isStandalonePage) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isOpen, isStandalonePage]);

  if (!isOpen && !isStandalonePage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] w-screen h-screen bg-black overflow-hidden cursor-pointer select-none flex items-center justify-center"
        onClick={handleClose}
        title="Click anywhere or press ESC to exit"
      >
        {/* Full-Screen Edge-to-Edge Video Playback (Pure Video, No UI/Buttons) */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          playsInline
          className="w-full h-full object-contain bg-black pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoShowcaseModal;
