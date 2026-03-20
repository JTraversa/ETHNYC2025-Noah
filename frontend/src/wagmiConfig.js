import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  linea,
  scroll,
  polygon,
  bsc,
  avalanche,
  sonic,
  berachain,
  mantle,
  flare,
  flowMainnet,
  monad,
  cronos,
  gnosis,
  celo,
  sei,
  tempo,
  sepolia,
  arbitrumSepolia,
} from 'viem/chains';

// Local chain icons
import flareIcon from './assets/chains/flare.png';
import sonicIcon from './assets/chains/sonic.webp';
import seiIcon from './assets/chains/sei.png';
import megaethIcon from './assets/chains/megaeth.png';
import monadIcon from './assets/chains/monad.png';
import stableIcon from './assets/chains/stable.svg';
import tempoIcon from './assets/chains/tempo.svg';

// --- Custom chains not in viem ---

const megaETH = {
  id: 4326,
  name: 'MegaETH',
  nativeCurrency: { name: 'MegaETH', symbol: 'MEGA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.megaeth.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'MegaETH Explorer', url: 'https://megaeth.blockscout.com' },
  },
  iconUrl: megaethIcon,
};

const stableChain = {
  id: 988,
  name: 'Stable',
  nativeCurrency: { name: 'gUSDT', symbol: 'gUSDT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.stable.xyz'] },
  },
  blockExplorers: {
    default: { name: 'StableScan', url: 'https://stablescan.xyz' },
  },
  iconUrl: stableIcon,
};

// --- Override icons and clean up names for viem chains ---

const flareFixed = { ...flare, name: 'Flare', iconUrl: flareIcon };
const sonicFixed = { ...sonic, iconUrl: sonicIcon };
const monadFixed = { ...monad, iconUrl: monadIcon };
const seiFixed = { ...sei, name: 'Sei', iconUrl: seiIcon };
const flowFixed = { ...flowMainnet, name: 'Flow' };
const lineaFixed = { ...linea, name: 'Linea' };
const optimismFixed = { ...optimism, name: 'Optimism' };
const cronosFixed = { ...cronos, name: 'Cronos' };
const tempoFixed = { ...tempo, name: 'Tempo', iconUrl: tempoIcon };

// --- Chain groups ---

export const mainnetChains = [
  mainnet,
  arbitrum,
  base,
  optimismFixed,
  lineaFixed,
  scroll,
  polygon,
  bsc,
  avalanche,
  sonicFixed,
  berachain,
  mantle,
  flareFixed,
  flowFixed,
  monadFixed,
  megaETH,
  stableChain,
  cronosFixed,
  gnosis,
  celo,
  seiFixed,
  tempoFixed,
];

export const testnetChains = [
  sepolia,
  arbitrumSepolia,
];

// --- Config factory ---

export function createConfig(includeTestnets = false) {
  const chains = includeTestnets
    ? [...mainnetChains, ...testnetChains]
    : mainnetChains;

  return getDefaultConfig({
    appName: 'Noah',
    projectId: 'noah-app',
    chains,
  });
}

// Default config (mainnets only)
export const config = createConfig(false);
