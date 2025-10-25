// Chain configurations for Vincent SDK execution
// Supported chains for Uniswap V3 swaps

export const SUPPORTED_CHAINS = {
  // Mainnets
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    nativeCurrency: 'ETH',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
    nativeCurrency: 'MATIC',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
    nativeCurrency: 'ETH',
  },
  optimism: {
    chainId: 10,
    name: 'Optimism',
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://optimism.llamarpc.com',
    nativeCurrency: 'ETH',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    nativeCurrency: 'ETH',
  },
  bnb: {
    chainId: 56,
    name: 'BNB Chain',
    rpcUrl: process.env.BNB_RPC_URL || 'https://bsc.llamarpc.com',
    nativeCurrency: 'BNB',
  },
  avalanche: {
    chainId: 43114,
    name: 'Avalanche',
    rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://avalanche.llamarpc.com',
    nativeCurrency: 'AVAX',
  },
  celo: {
    chainId: 42220,
    name: 'Celo',
    rpcUrl: process.env.CELO_RPC_URL || 'https://forno.celo.org',
    nativeCurrency: 'CELO',
  },
  
  // Testnets
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    nativeCurrency: 'ETH',
  },
  basesepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    nativeCurrency: 'ETH',
  },
  arbitrumsepolia: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    nativeCurrency: 'ETH',
  },
  optimismsepolia: {
    chainId: 11155420,
    name: 'Optimism Sepolia',
    rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
    nativeCurrency: 'ETH',
  },
  avalanchefuji: {
    chainId: 43113,
    name: 'Avalanche Fuji',
    rpcUrl: process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    nativeCurrency: 'AVAX',
  },
  polygonmumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    nativeCurrency: 'MATIC',
  },
};

// Helper function to get chain config by name
export function getChainConfig(chainName) {
  const chain = SUPPORTED_CHAINS[chainName];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainName}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`);
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
  'ethereum',
  'polygon',
  'arbitrum',
  'optimism',
  'base',
  'bnb',
  'avalanche',
  'celo',
];

// List of testnet chain names
export const TESTNET_CHAINS = [
  'sepolia',
  'basesepolia',
  'arbitrumsepolia',
  'optimismsepolia',
  'avalanchefuji',
  'polygonmumbai',
];
