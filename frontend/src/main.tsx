import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Silently suppress third-party browser extension VM errors (e.g. React DevTools / Web Vitals reportAllChanges)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (
      e.message?.includes('startTime') || 
      e.message?.includes('reportAllChanges') ||
      e.message?.includes('ResizeObserver loop')
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (
      e.reason?.message?.includes('startTime') || 
      e.reason?.message?.includes('reportAllChanges')
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
