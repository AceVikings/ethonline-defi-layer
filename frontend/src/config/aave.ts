// Aave V3 Sepolia Testnet Configuration
export const AAVE_V3_SEPOLIA = {
  // Core Protocol Contracts
  POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  POOL_DATA_PROVIDER: "0x3e9708d80f7B3e43118013075F7e95CE3AB31F31",
  ORACLE: "0x2Cc5cB8e4B2Eeb1A8C4C3E1d0eFe4Dc8e5b59F96",
  
  // Supported Assets on Sepolia
  ASSETS: {
    USDC: {
      address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
      aToken: "0x16dA4541aD1807f4443d92D26044C1147406EB80",
      decimals: 6,
      symbol: "USDC",
    },
    USDT: {
      address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
      aToken: "0x978206fAe13faF5a8d293FB614326B237684B750",
      decimals: 6,
      symbol: "USDT",
    },
    DAI: {
      address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      aToken: "0x29598b72eb5CeBd806C5dCD549490FdA35B13cD8",
      decimals: 18,
      symbol: "DAI",
    },
    WETH: {
      address: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
      aToken: "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830",
      decimals: 18,
      symbol: "WETH",
    },
  },
  
  // Chain ID
  CHAIN_ID: 11155111,
  CHAIN_NAME: "Sepolia",
} as const;

// Aave Pool ABI - Supply function
export const AAVE_POOL_ABI = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC20 Token ABI - For approval
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Helper function to get token address on Sepolia
export function getAaveAssetAddress(symbol: "USDC" | "USDT" | "DAI" | "WETH") {
  return AAVE_V3_SEPOLIA.ASSETS[symbol].address as `0x${string}`;
}

// Helper function to get aToken address
export function getATokenAddress(symbol: "USDC" | "USDT" | "DAI" | "WETH") {
  return AAVE_V3_SEPOLIA.ASSETS[symbol].aToken as `0x${string}`;
}

// Helper to check if token is supported
export function isSupportedAaveAsset(symbol: string): symbol is "USDC" | "USDT" | "DAI" | "WETH" {
  return symbol in AAVE_V3_SEPOLIA.ASSETS;
}

// Get all supported token symbols
export function getSupportedAaveTokens() {
  return Object.keys(AAVE_V3_SEPOLIA.ASSETS) as Array<"USDC" | "USDT" | "DAI" | "WETH">;
}
