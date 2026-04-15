import React, { useRef, useEffect, useState } from 'react';

// Chain icons
import ethereumIcon from '../assets/chains/ethereum.png';
import arbitrumIcon from '../assets/chains/arbitrum.png';
import baseIcon from '../assets/chains/base.png';
import optimismIcon from '../assets/chains/optimism.png';
import lineaIcon from '../assets/chains/linea.png';
import scrollIcon from '../assets/chains/scroll.png';
import polygonIcon from '../assets/chains/polygon.png';
import bscIcon from '../assets/chains/bsc.png';
import avalancheIcon from '../assets/chains/avalanche.png';
import sonicIcon from '../assets/chains/sonic.png';
import berachainIcon from '../assets/chains/berachain.png';
import mantleIcon from '../assets/chains/mantle.png';
import flareIcon from '../assets/chains/flare.png';
import flowIcon from '../assets/chains/flow.png';
import monadIcon from '../assets/chains/monad.png';
import megaethIcon from '../assets/chains/megaeth.png';
import stableIcon from '../assets/chains/stable.svg';
import cronosIcon from '../assets/chains/cronos.png';
import gnosisIcon from '../assets/chains/gnosis.png';
import celoIcon from '../assets/chains/celo.png';
import seiIcon from '../assets/chains/sei.png';
import tempoIcon from '../assets/chains/tempo.svg';
import plasmaIcon from '../assets/chains/plasma.png';
import inkIcon from '../assets/chains/ink.png';
import katanaIcon from '../assets/chains/katana.png';

const chains = [
  { name: 'Ethereum', icon: ethereumIcon },
  { name: 'Arbitrum', icon: arbitrumIcon },
  { name: 'Base', icon: baseIcon },
  { name: 'Optimism', icon: optimismIcon },
  { name: 'Linea', icon: lineaIcon },
  { name: 'Scroll', icon: scrollIcon },
  { name: 'Polygon', icon: polygonIcon },
  { name: 'BSC', icon: bscIcon },
  { name: 'Avalanche', icon: avalancheIcon },
  { name: 'Sonic', icon: sonicIcon },
  { name: 'Berachain', icon: berachainIcon },
  { name: 'Mantle', icon: mantleIcon },
  { name: 'Flare', icon: flareIcon },
  { name: 'Flow', icon: flowIcon },
  { name: 'Monad', icon: monadIcon },
  { name: 'MegaETH', icon: megaethIcon },
  { name: 'Stable', icon: stableIcon },
  { name: 'Cronos', icon: cronosIcon },
  { name: 'Gnosis', icon: gnosisIcon },
  { name: 'Celo', icon: celoIcon },
  { name: 'Sei', icon: seiIcon },
  { name: 'Tempo', icon: tempoIcon },
  { name: 'Plasma', icon: plasmaIcon },
  { name: 'Ink', icon: inkIcon },
  { name: 'Katana', icon: katanaIcon },
];

const GAP = 32;

const ChainItem = ({ name, icon }) => (
  <div className="flex flex-col items-center flex-shrink-0 w-[36px] md:w-[44px]">
    <img
      src={icon}
      alt={name}
      className="w-[36px] h-[36px] md:w-[44px] md:h-[44px] rounded-[10px] object-cover"
      loading="eager"
    />
    <span className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-1.5 md:mt-2 whitespace-nowrap">
      {name}
    </span>
  </div>
);

function ChainBanner({ twitter = 'traversajulian' }) {
  const setRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (setRef.current) {
      // Measure the width of the first set of chains + one gap (the seam gap)
      setOffset(setRef.current.offsetWidth + GAP);
    }
  }, []);

  return (
    <div className="rounded-2xl p-4 md:p-6 overflow-hidden bg-white/70 border border-white/80 shadow-[0_8px_32px_rgba(99,102,241,0.1)]">
      {offset > 0 && (
        <style>{`
          @keyframes marquee {
            from { transform: translate3d(0, 0, 0); }
            to { transform: translate3d(-${offset}px, 0, 0); }
          }
          .marquee-track:hover .marquee-strip {
            animation-play-state: paused;
          }
        `}</style>
      )}

      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-slate-700 text-center">
        Supported Ecosystems
      </h3>

      <div
        className="marquee-track relative overflow-x-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent)',
        }}
      >
        <div
          className="marquee-strip"
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            animation: offset > 0 ? 'marquee 30s linear infinite' : 'none',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          <div ref={setRef} style={{ display: 'flex', gap: `${GAP}px` }}>
            {chains.map((chain, i) => (
              <ChainItem key={i} {...chain} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: `${GAP}px` }}>
            {chains.map((chain, i) => (
              <ChainItem key={`dup-${i}`} {...chain} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-400 text-center mt-4">
        Want support for your ecosystem? Reach out to{' '}
        <a
          href={`https://x.com/${twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
        >
          @{twitter}
        </a>
      </p>
    </div>
  );
}

export default ChainBanner;
