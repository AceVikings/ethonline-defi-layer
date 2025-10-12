import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { hederaTestnet, hederaMainnet } from './chains';

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
  appName: 'DeFi A2A Liquidity Unifier',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [hederaTestnet, hederaMainnet],
  wallets,
  ssr: false, // Vite doesn't use SSR by default
});
