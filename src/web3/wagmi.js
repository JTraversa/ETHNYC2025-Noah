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

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, chiliz],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [chiliz.id]: http('https://rpc.chiliz.com'),
  },
});


