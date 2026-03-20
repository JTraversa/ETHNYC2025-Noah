import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function TestnetToggle() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('noah-show-testnets') === 'true'; }
    catch { return false; }
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem('noah-show-testnets', String(next)); } catch {}
    window.dispatchEvent(new CustomEvent('noah-testnets-toggle', { detail: next }));
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        enabled ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 hover:text-slate-500'
      }`}
      title={enabled ? 'Testnets visible' : 'Show testnets'}
    >
      <div className={`w-5 h-3 rounded-full relative transition-colors ${enabled ? 'bg-amber-400' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-2.5' : 'translate-x-0.5'}`} />
      </div>
      Testnets
    </button>
  );
}

function Footer() {
  const location = useLocation();
  const isApp = location.pathname === '/app';

  return (
    <footer className="relative z-20 flex items-center justify-between text-sm text-slate-500 py-4 px-4 md:fixed md:bottom-8 md:left-8 md:right-8 md:py-0 md:px-0">
      <div className="flex-shrink-0">
        {isApp && <TestnetToggle />}
      </div>
      <div className="flex gap-6">
        <a href="https://x.com/trynoahxyz" className="hover:text-indigo-600 transition-colors">Twitter</a>
        <a href="#" className="hover:text-indigo-600 transition-colors">Discord</a>
        <a href="https://github.com/JTraversa/Noah" className="hover:text-indigo-600 transition-colors">GitHub</a>
      </div>
    </footer>
  );
}

export default Footer;
