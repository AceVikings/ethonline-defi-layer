import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { 
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy
} from 'wagmi/chains';
import { defineChain } from 'viem';

// Monad Testnet (not in wagmi/chains yet)
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

const wallets = [
  {
    groupName: 'Recommended',
    wallets: [rainbowWallet, metaMaskWallet, coinbaseWallet],
  },
  {
    groupName: 'Other',
    wallets: [walletConnectWallet],
  },
];

export const config = getDefaultConfig({
  appName: 'AlphaFlow - Autonomous Multi-Chain DeFi',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
    polygonAmoy,
    monadTestnet
  ],
  wallets,
  ssr: false,
});
