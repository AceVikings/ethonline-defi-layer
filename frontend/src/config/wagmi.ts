import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { 
  // Testnets
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
  // Mainnets
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
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

/**
 * Testnet chains supported by Avail Nexus
 * - Sepolia (Ethereum testnet) - Primary testnet
 * - Polygon Amoy
 * - Base Sepolia
 * - Arbitrum Sepolia
 * - Optimism Sepolia
 * - Monad Testnet
 */
export const testnetChains = [
  sepolia,
  polygonAmoy,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  monadTestnet
] as const;

/**
 * Mainnet chains supported by Avail Nexus
 * - Ethereum Mainnet
 * - Polygon - Primary for Aave V3
 * - Arbitrum
 * - Optimism
 * - Base
 */
export const mainnetChains = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
] as const;

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

/**
 * Default Wagmi configuration with testnet chains
 * This will be dynamically updated based on network mode
 */
export const config = getDefaultConfig({
  appName: 'AlphaFlow - Autonomous Multi-Chain DeFi',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    ...testnetChains,
    ...mainnetChains,
  ] as any,
  wallets,
  ssr: false,
});
