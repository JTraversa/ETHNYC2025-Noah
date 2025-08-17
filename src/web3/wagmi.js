import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum } from 'wagmi/chains';

// Custom Chiliz chain (id: 88888)
const chiliz = {
  id: 88888,
  name: 'Chiliz',
  nativeCurrency: { name: 'Chiliz', symbol: 'CHZ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.chiliz.com'] },
    public: { http: ['https://rpc.chiliz.com'] },
  },
  blockExplorers: {
    default: { name: 'ChilizScan', url: 'https://scan.chiliz.com' },
  },
  testnet: false,
};

// Custom Katana chain (id: 747474)
const katana = {
  id: 747474,
  name: 'Katana',
  nativeCurrency: { name: 'Katana ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.katana'] }, // Placeholder RPC; replace with the official endpoint
    public: { http: ['https://rpc.katana'] },
  },
  blockExplorers: {
    default: { name: 'KatanaScan', url: 'https://scan.katana' }, // Placeholder explorer
  },
  testnet: false,
};

// Hedera mainnet (chainId: 295)
const hedera = {
  id: 295,
  name: 'Hedera',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 }, // Some providers use 8; adjust if needed
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
    public: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
};

// Zircuit (chainId: 48900)
const zircuit = {
  id: 48900,
  name: 'Zircuit',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.zircuit.network'] }, // Placeholder; replace with official
    public: { http: ['https://rpc.zircuit.network'] },
  },
  blockExplorers: {
    default: { name: 'ZircuitScan', url: 'https://explorer.zircuit.network' },
  },
  testnet: false,
};

// Flow (chainId: 747)
const flow = {
  id: 747,
  name: 'Flow',
  nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.flow.org'] }, // Placeholder; replace with official
    public: { http: ['https://rpc.flow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://flowscan.org' }, // Placeholder
  },
  testnet: false,
};

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, chiliz, katana, hedera, zircuit, flow],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [chiliz.id]: http('https://rpc.chiliz.com'),
    [katana.id]: http('https://rpc.katana'),
    [hedera.id]: http('https://mainnet.hashio.io/api'),
    [zircuit.id]: http('https://rpc.zircuit.network'),
    [flow.id]: http('https://rpc.flow.org'),
  },
});


