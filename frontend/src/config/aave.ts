// Aave V3 Configuration - Multi-Network Support
// Using official @bgd-labs/aave-address-book for verified addresses

import { POLYGON_V3_ADDRESSES, POLYGON_V3_ASSETS } from "./aaveAddressBook";

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
  EXPLORER: "https://sepolia.etherscan.io",
  IS_TESTNET: true,
} as const;

// Aave V3 Polygon Mainnet Configuration
// Using official Aave Address Book for verified contract addresses
export const AAVE_V3_POLYGON = {
  // Core Protocol Contracts (from @bgd-labs/aave-address-book)
  POOL: POLYGON_V3_ADDRESSES.POOL,
  POOL_DATA_PROVIDER: POLYGON_V3_ADDRESSES.POOL_DATA_PROVIDER,
  POOL_ADDRESSES_PROVIDER: POLYGON_V3_ADDRESSES.POOL_ADDRESSES_PROVIDER,
  POOL_CONFIGURATOR: POLYGON_V3_ADDRESSES.POOL_CONFIGURATOR,
  ORACLE: POLYGON_V3_ADDRESSES.ORACLE,
  
  // Additional Protocol Contracts
  UI_POOL_DATA_PROVIDER: POLYGON_V3_ADDRESSES.UI_POOL_DATA_PROVIDER,
  UI_INCENTIVE_DATA_PROVIDER: POLYGON_V3_ADDRESSES.UI_INCENTIVE_DATA_PROVIDER,
  ACL_MANAGER: POLYGON_V3_ADDRESSES.ACL_MANAGER,
  ACL_ADMIN: POLYGON_V3_ADDRESSES.ACL_ADMIN,
  WALLET_BALANCE_PROVIDER: POLYGON_V3_ADDRESSES.WALLET_BALANCE_PROVIDER,
  WRAPPED_TOKEN_GATEWAY: POLYGON_V3_ADDRESSES.WRAPPED_TOKEN_GATEWAY,
  TREASURY_COLLECTOR: POLYGON_V3_ADDRESSES.TREASURY_COLLECTOR,
  INCENTIVES_CONTROLLER: POLYGON_V3_ADDRESSES.INCENTIVES_CONTROLLER,
  EMISSION_MANAGER: POLYGON_V3_ADDRESSES.EMISSION_MANAGER,
  REGISTRY: POLYGON_V3_ADDRESSES.REGISTRY,
  REPAY_WITH_COLLATERAL: POLYGON_V3_ADDRESSES.REPAY_WITH_COLLATERAL,
  COLLATERAL_SWITCH: POLYGON_V3_ADDRESSES.COLLATERAL_SWITCH,
  DEBT_SWITCH: POLYGON_V3_ADDRESSES.DEBT_SWITCH,
  WITHDRAW_SWITCH: POLYGON_V3_ADDRESSES.WITHDRAW_SWITCH,
  RISK_STEWARD: POLYGON_V3_ADDRESSES.RISK_STEWARD,
  
  // Supported Assets on Polygon (from Address Book)
  ASSETS: POLYGON_V3_ASSETS,
  
  // Chain ID
  CHAIN_ID: POLYGON_V3_ADDRESSES.CHAIN_ID,
  CHAIN_NAME: POLYGON_V3_ADDRESSES.CHAIN_NAME,
  EXPLORER: POLYGON_V3_ADDRESSES.EXPLORER,
  IS_TESTNET: POLYGON_V3_ADDRESSES.IS_TESTNET,
} as const;

// Network Mode Type
export type NetworkMode = "testnet" | "mainnet";

// Get active Aave config based on mode
export const getAaveConfig = (mode: NetworkMode) => {
  return mode === "mainnet" ? AAVE_V3_POLYGON : AAVE_V3_SEPOLIA;
};

// Aave Pool ABI - Supply functions
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
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "permitV", type: "uint8" },
      { internalType: "bytes32", name: "permitR", type: "bytes32" },
      { internalType: "bytes32", name: "permitS", type: "bytes32" },
    ],
    name: "supplyWithPermit",
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

// ERC20 Token ABI - For approval and permit
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
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Helper function to get token address based on network mode
export function getAaveAssetAddress(
  symbol: "USDC" | "USDT" | "DAI" | "WETH" | "WMATIC",
  mode: NetworkMode = "testnet"
) {
  const config = getAaveConfig(mode);
  return (config.ASSETS as any)[symbol]?.address as `0x${string}` | undefined;
}

// Helper function to get aToken address
export function getATokenAddress(
  symbol: "USDC" | "USDT" | "DAI" | "WETH" | "WMATIC",
  mode: NetworkMode = "testnet"
) {
  const config = getAaveConfig(mode);
  return (config.ASSETS as any)[symbol]?.aToken as `0x${string}` | undefined;
}

// Helper to check if token is supported on network
export function isSupportedAaveAsset(
  symbol: string,
  mode: NetworkMode = "testnet"
): symbol is "USDC" | "USDT" | "DAI" | "WETH" | "WMATIC" {
  const config = getAaveConfig(mode);
  return symbol in config.ASSETS;
}

// Get all supported token symbols for network
export function getSupportedAaveTokens(mode: NetworkMode = "testnet") {
  const config = getAaveConfig(mode);
  return Object.keys(config.ASSETS) as Array<"USDC" | "USDT" | "DAI" | "WETH" | "WMATIC">;
}

