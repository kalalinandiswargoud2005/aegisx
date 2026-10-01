import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function triggerCollegeLogoShowcase() {
  window.dispatchEvent(new CustomEvent('open-college-logo-showcase'));
}

interface CollegeLogoShowcaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function CollegeLogoShowcaseModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  isStandalonePage = false,
}: CollegeLogoShowcaseModalProps) {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Exact unedited original image
  const logoSrc = '/malla_reddy_university_logo.jpg';

  const handleClose = () => {
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
    const handleOpen = () => setInternalIsOpen(true);
    window.addEventListener('open-college-logo-showcase', handleOpen);
    return () => window.removeEventListener('open-college-logo-showcase', handleOpen);
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

  if (!isOpen && !isStandalonePage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] w-screen h-screen bg-white overflow-hidden cursor-pointer select-none"
        onClick={handleClose}
        title="Click anywhere or press ESC to exit"
      >
        {/* Dynamic Wallpaper Motion Animation */}
        <style>{`
          @keyframes liveWallpaperAnimation {
            0% {
              transform: scale(1) translate3d(0, 0, 0);
            }
            33% {
              transform: scale(1.035) translate3d(-0.8%, -1.2%, 0);
            }
            66% {
              transform: scale(1.025) translate3d(0.8%, 1%, 0);
            }
            100% {
              transform: scale(1) translate3d(0, 0, 0);
            }
          }

          .wallpaper-bg {
            position: absolute;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background-color: #ffffff;
            background-image: url('${logoSrc}');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: contain;
            animation: liveWallpaperAnimation 12s ease-in-out infinite;
            will-change: transform;
            transform-origin: center center;
          }
        `}</style>

        {/* Full-Screen Edge-to-Edge Wallpaper (No buttons, no cards, no borders) */}
        <div className="wallpaper-bg" />
      </motion.div>
    </AnimatePresence>
  );
}
