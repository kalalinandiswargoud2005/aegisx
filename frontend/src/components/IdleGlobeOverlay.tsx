import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * IdleGlobeOverlay.tsx -> Refactored to IdleTitleRedirect
 *
 * Listens for user inactivity (no mouse, touch, key, or scroll activity).
 * If the screen is untouched for 60 seconds, redirects to the Title / Landing Page ("/").
 */
export function IdleGlobeOverlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If already on title/landing page ("/"), no need to redirect
    if (location.pathname === '/') return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Untouched screen -> Redirect to Title Page
        navigate('/');
      }, 60000); // 60 seconds idle threshold
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, location.pathname]);

  return null;
}
