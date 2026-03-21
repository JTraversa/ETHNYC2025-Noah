import React, { useRef, useEffect } from 'react';

// Chain icons
import ethereumIcon from '../assets/chains/ethereum.jpg';
import arbitrumIcon from '../assets/chains/arbitrum.jpg';
import baseIcon from '../assets/chains/base.jpg';
import optimismIcon from '../assets/chains/optimism.jpg';
import lineaIcon from '../assets/chains/linea.jpg';
import scrollIcon from '../assets/chains/scroll.jpg';
import polygonIcon from '../assets/chains/polygon.jpg';
import bscIcon from '../assets/chains/bsc.jpg';
import avalancheIcon from '../assets/chains/avalanche.jpg';
import sonicIcon from '../assets/chains/sonic.webp';
import berachainIcon from '../assets/chains/berachain.jpg';
import mantleIcon from '../assets/chains/mantle.jpg';
import flareIcon from '../assets/chains/flare.png';
import flowIcon from '../assets/chains/flow.jpg';
import monadIcon from '../assets/chains/monad.png';
import megaethIcon from '../assets/chains/megaeth.png';
import stableIcon from '../assets/chains/stable.svg';
import cronosIcon from '../assets/chains/cronos.jpg';
import gnosisIcon from '../assets/chains/gnosis.jpg';
import celoIcon from '../assets/chains/celo.jpg';
import seiIcon from '../assets/chains/sei.png';
import tempoIcon from '../assets/chains/tempo.svg';
import plasmaIcon from '../assets/chains/plasma.jpg';
import inkIcon from '../assets/chains/ink.jpg';
import katanaIcon from '../assets/chains/katana.jpg';

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

const ICON_SIZE = 44;
const GAP = 60;
const LABEL_OFFSET = 16;
const ROW_HEIGHT = ICON_SIZE + LABEL_OFFSET + 14;
const SPEED = 35; // px per second
const RADIUS = 10;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function ChainBanner({ twitter = 'traversajulian' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Load all images first
    const images = [];
    let loaded = 0;
    let stripWidth = 0;
    let offset = 0;
    let raf;
    let paused = false;
    let lastTime = 0;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = ROW_HEIGHT * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = ROW_HEIGHT + 'px';
      ctx.scale(dpr, dpr);
    };

    const draw = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!paused && delta < 100) {
        offset += SPEED * (delta / 1000);
        if (offset >= stripWidth) offset -= stripWidth;
      }

      const w = canvas.width / dpr;
      ctx.clearRect(0, 0, w, ROW_HEIGHT);

      // Draw chains
      const startX = -offset;
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < chains.length; i++) {
          const x = startX + pass * stripWidth + i * (ICON_SIZE + GAP);
          if (x > w + ICON_SIZE) break;
          if (x < -ICON_SIZE - GAP) continue;

          // Draw rounded icon
          if (images[i]) {
            ctx.save();
            roundRect(ctx, x, 0, ICON_SIZE, ICON_SIZE, RADIUS);
            ctx.clip();
            ctx.drawImage(images[i], x, 0, ICON_SIZE, ICON_SIZE);
            ctx.restore();
          }

          // Draw label
          ctx.fillStyle = '#64748b';
          ctx.font = '500 11px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(chains[i].name, x + ICON_SIZE / 2, ICON_SIZE + LABEL_OFFSET);
        }
      }

      // Fade edges
      const fadeW = 60;
      const gradL = ctx.createLinearGradient(0, 0, fadeW, 0);
      gradL.addColorStop(0, 'rgba(255,255,255,0.85)');
      gradL.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, fadeW, ROW_HEIGHT);

      const gradR = ctx.createLinearGradient(w - fadeW, 0, w, 0);
      gradR.addColorStop(0, 'rgba(255,255,255,0)');
      gradR.addColorStop(1, 'rgba(255,255,255,0.85)');
      ctx.fillStyle = gradR;
      ctx.fillRect(w - fadeW, 0, fadeW, ROW_HEIGHT);

      raf = requestAnimationFrame(draw);
    };

    const startAnimation = () => {
      stripWidth = chains.length * (ICON_SIZE + GAP);
      resize();
      raf = requestAnimationFrame(draw);
    };

    // Load images
    chains.forEach((chain, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        images[i] = img;
        loaded++;
        if (loaded === chains.length) startAnimation();
      };
      img.onerror = () => {
        loaded++;
        if (loaded === chains.length) startAnimation();
      };
      img.src = chain.icon;
    });

    const handleEnter = () => { paused = true; };
    const handleLeave = () => { paused = false; };

    canvas.addEventListener('mouseenter', handleEnter);
    canvas.addEventListener('mouseleave', handleLeave);

    const onResize = () => {
      const prevDpr = dpr;
      resize();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener('mouseenter', handleEnter);
      canvas.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="rounded-2xl p-4 md:p-6 overflow-hidden bg-white/70 border border-white/80 shadow-[0_8px_32px_rgba(99,102,241,0.1)]">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-slate-700 text-center">
        Supported Ecosystems
      </h3>

      <div className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full cursor-default"
        />
      </div>

      <p className="text-xs md:text-sm text-slate-400 text-center mt-4">
        Want your ecosystem added? Reach out to{' '}
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
