import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig } from '../../wagmiConfig';
import AppPage from './AppPage';
import ConnectButton from './ConnectButton';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function ConnectButtonPortal() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const el = document.getElementById('connect-button-slot');
    if (el) setSlot(el);
  }, []);

  if (!slot) return null;
  return createPortal(<ConnectButton />, slot);
}

export default function AppWithWagmi() {
  const [showTestnets, setShowTestnets] = useState(() => {
    try { return localStorage.getItem('noah-show-testnets') === 'true'; }
    catch { return false; }
  });

  const handleToggle = useCallback((e) => {
    setShowTestnets(e.detail);
  }, []);

  useEffect(() => {
    window.addEventListener('noah-testnets-toggle', handleToggle);
    return () => window.removeEventListener('noah-testnets-toggle', handleToggle);
  }, [handleToggle]);

  const wagmiConfig = useMemo(() => createConfig(showTestnets), [showTestnets]);

  return (
    <WagmiProvider config={wagmiConfig} key={showTestnets ? 'testnets' : 'mainnets'}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectButtonPortal />
          <main className="relative z-10 flex-1 py-8 overflow-auto">
            <AppPage />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
