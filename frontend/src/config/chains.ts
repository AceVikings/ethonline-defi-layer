import { type Chain } from "@rainbow-me/rainbowkit";

// Hedera Testnet Configuration
export const hederaTestnet = {
  id: 296, // Hedera Testnet Chain ID
  name: "Hedera Testnet",
  iconUrl: "https://hedera.com/logo.svg",
  iconBackground: "#000",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/testnet",
    },
  },
  testnet: true,
} as const satisfies Chain;

// Hedera Mainnet Configuration
export const hederaMainnet = {
  id: 295, // Hedera Mainnet Chain ID
  name: "Hedera Mainnet",
  iconUrl: "https://hedera.com/logo.svg",
  iconBackground: "#000",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 8,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/mainnet",
    },
  },
  testnet: false,
} as const satisfies Chain;
