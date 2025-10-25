// Chain configurations for Vincent SDK execution
// Supported chains for Uniswap V3 swaps

// Special address used to represent native ETH in frontend
const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
import dotenv from "dotenv";
dotenv.config();
export const SUPPORTED_CHAINS = {
  // Mainnets
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: process.env.RPC_ETHEREUM || "https://eth.llamarpc.com",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: process.env.RPC_POLYGON || "https://polygon.llamarpc.com",
    nativeCurrency: "MATIC",
    wrappedNativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum",
    rpcUrl: process.env.RPC_ARBITRUM || "https://arbitrum.llamarpc.com",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: process.env.RPC_OPTIMISM || "https://optimism.llamarpc.com",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: process.env.RPC_BASE || "https://mainnet.base.org",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  bnb: {
    chainId: 56,
    name: "BNB Chain",
    rpcUrl: process.env.RPC_BNB || "https://bsc.llamarpc.com",
    nativeCurrency: "BNB",
    wrappedNativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
  },
  avalanche: {
    chainId: 43114,
    name: "Avalanche",
    rpcUrl: process.env.RPC_AVALANCHE || "https://avalanche.llamarpc.com",
    nativeCurrency: "AVAX",
    wrappedNativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
  },
  celo: {
    chainId: 42220,
    name: "Celo",
    rpcUrl: process.env.RPC_CELO || "https://forno.celo.org",
    nativeCurrency: "CELO",
    wrappedNativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438", // CELO (Celo native is ERC20)
  },

  // Testnets
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: process.env.RPC_SEPOLIA || "https://rpc.sepolia.org",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH
  },
  basesepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: process.env.RPC_BASESEPOLIA || "https://sepolia.base.org",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  arbitrumsepolia: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    rpcUrl:
      process.env.RPC_ARBITRUMSEPOLIA ||
      "https://sepolia-rollup.arbitrum.io/rpc",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // WETH
  },
  optimismsepolia: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    rpcUrl: process.env.RPC_OPTIMISMSEPOLIA || "https://sepolia.optimism.io",
    nativeCurrency: "ETH",
    wrappedNativeToken: "0x4200000000000000000000000000000000000006", // WETH
  },
  avalanchefuji: {
    chainId: 43113,
    name: "Avalanche Fuji",
    rpcUrl:
      process.env.RPC_AVALANCHEFUJI ||
      "https://api.avax-test.network/ext/bc/C/rpc",
    nativeCurrency: "AVAX",
    wrappedNativeToken: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", // WAVAX
  },
  polygonmumbai: {
    chainId: 80001,
    name: "Polygon Mumbai",
    rpcUrl:
      process.env.RPC_POLYGONMUMBAI || "https://rpc-mumbai.maticvigil.com",
    nativeCurrency: "MATIC",
    wrappedNativeToken: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // WMATIC
  },
};

// Helper function to get chain config by name
export function getChainConfig(chainName) {
  const chain = SUPPORTED_CHAINS[chainName];
  if (!chain) {
    throw new Error(
      `Unsupported chain: ${chainName}. Supported chains: ${Object.keys(
        SUPPORTED_CHAINS
      ).join(", ")}`
    );
  }
  return chain;
}

// Helper function to get RPC URL for a chain
export function getRpcUrl(chainName) {
  return getChainConfig(chainName).rpcUrl;
}

// Helper function to get chain ID
export function getChainId(chainName) {
  return getChainConfig(chainName).chainId;
}

// List of all supported chain names
export const CHAIN_NAMES = Object.keys(SUPPORTED_CHAINS);

// List of mainnet chain names
export const MAINNET_CHAINS = [
  "ethereum",
  "polygon",
  "arbitrum",
  "optimism",
  "base",
  "bnb",
  "avalanche",
  "celo",
];

// List of testnet chain names
export const TESTNET_CHAINS = [
  "sepolia",
  "basesepolia",
  "arbitrumsepolia",
  "optimismsepolia",
  "avalanchefuji",
  "polygonmumbai",
];

/**
 * Convert native ETH placeholder address to actual WETH address
 * Uniswap V3 requires WETH address, not the 0xEee... placeholder
 */
export function normalizeTokenAddress(chainName, tokenAddress) {
  const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  // If it's the native ETH placeholder, return WETH address
  if (tokenAddress.toLowerCase() === NATIVE_ETH_ADDRESS.toLowerCase()) {
    const chain = getChainConfig(chainName);
    return chain.wrappedNativeToken;
  }

  return tokenAddress;
}
