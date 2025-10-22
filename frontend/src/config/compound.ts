// Compound V3 (Comet) Configuration
// Supporting Base and Polygon Mainnet

// Base Mainnet - USDC Market
export const COMPOUND_V3_BASE_USDC = {
  // Core Comet Contract (Proxy)
  COMET: "0xb125E6687d4313864e53df431d5425969c15Eb2F",
  
  // Base Asset
  BASE_ASSET: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    symbol: "USDC",
    decimals: 6,
  },
  
  // Supported Collateral Assets
  COLLATERAL_ASSETS: {
    WETH: {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      decimals: 18,
    },
    cbETH: {
      address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      symbol: "cbETH",
      decimals: 18,
    },
    wstETH: {
      address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
      symbol: "wstETH",
      decimals: 18,
    },
  },
  
  // Rewards
  REWARDS: "0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1",
  
  // Bulker (for batched transactions)
  BULKER: "0x78D0677032A35c63D142a48A2037048871212a8C",
  
  // Chain Info
  CHAIN_ID: 8453,
  CHAIN_NAME: "Base",
  EXPLORER: "https://basescan.org",
  IS_TESTNET: false,
} as const;

// Polygon Mainnet - USDC Market
export const COMPOUND_V3_POLYGON_USDC = {
  // Core Comet Contract (Proxy)
  COMET: "0xF25212E676D1F7F89Cd72fFEe66158f541246445",
  
  // Base Asset
  BASE_ASSET: {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
    symbol: "USDC",
    decimals: 6,
  },
  
  // Supported Collateral Assets
  COLLATERAL_ASSETS: {
    WETH: {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      symbol: "WETH",
      decimals: 18,
    },
    WBTC: {
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      symbol: "WBTC",
      decimals: 8,
    },
    WMATIC: {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      symbol: "WMATIC",
      decimals: 18,
    },
    stMATIC: {
      address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
      symbol: "stMATIC",
      decimals: 18,
    },
    MaticX: {
      address: "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6",
      symbol: "MaticX",
      decimals: 18,
    },
  },
  
  // Rewards
  REWARDS: "0x45939657d1CA34A8FA39A924B71D28Fe8431e581",
  
  // Bulker (for batched transactions)
  BULKER: "0x59e242D352ae13166B4987aE5c990C232f7f7CD6",
  
  // Chain Info
  CHAIN_ID: 137,
  CHAIN_NAME: "Polygon",
  EXPLORER: "https://polygonscan.com",
  IS_TESTNET: false,
} as const;

// Get Compound config based on chain ID
export const getCompoundConfigByChainId = (chainId: number | undefined) => {
  switch (chainId) {
    case 8453: // Base Mainnet
      return COMPOUND_V3_BASE_USDC;
    case 137: // Polygon Mainnet
      return COMPOUND_V3_POLYGON_USDC;
    default:
      // Default to Base mainnet if chain not supported
      return COMPOUND_V3_BASE_USDC;
  }
};

// Comet ABI - Essential functions for supply, withdraw, borrow, repay
export const COMET_ABI = [
  // Supply base or collateral
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Withdraw collateral or borrow base
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Get user's balance of base asset (positive = supply, negative = borrow)
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "int256", name: "", type: "int256" }],
    stateMutability: "view",
    type: "function",
  },
  // Get user's balance of collateral asset
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "address", name: "asset", type: "address" },
    ],
    name: "collateralBalanceOf",
    outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
  // Get borrow balance
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "borrowBalanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Get supply rate
  {
    inputs: [{ internalType: "uint256", name: "utilization", type: "uint256" }],
    name: "getSupplyRate",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  // Get borrow rate
  {
    inputs: [{ internalType: "uint256", name: "utilization", type: "uint256" }],
    name: "getBorrowRate",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  // Get utilization
  {
    inputs: [],
    name: "getUtilization",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Check if borrow is collateralized
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "isBorrowCollateralized",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Get asset info
  {
    inputs: [{ internalType: "uint8", name: "i", type: "uint8" }],
    name: "getAssetInfo",
    outputs: [
      {
        components: [
          { internalType: "uint8", name: "offset", type: "uint8" },
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "address", name: "priceFeed", type: "address" },
          { internalType: "uint64", name: "scale", type: "uint64" },
          { internalType: "uint64", name: "borrowCollateralFactor", type: "uint64" },
          { internalType: "uint64", name: "liquidateCollateralFactor", type: "uint64" },
          { internalType: "uint64", name: "liquidationFactor", type: "uint64" },
          { internalType: "uint128", name: "supplyCap", type: "uint128" },
        ],
        internalType: "struct CometCore.AssetInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Get number of assets
  {
    inputs: [],
    name: "numAssets",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  // Get total supply
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Get total borrow
  {
    inputs: [],
    name: "totalBorrow",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Base token (ERC-20 compatibility)
  {
    inputs: [],
    name: "baseToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Standard ERC-20 ABI (for approvals)
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
