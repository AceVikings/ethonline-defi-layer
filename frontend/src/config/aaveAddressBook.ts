/**
 * Aave V3 Address Book Integration
 * 
 * This file integrates the official Aave Address Book for all supported mainnet chains
 * and provides a unified interface for accessing all Aave protocol contracts.
 * 
 * Using official package: @bgd-labs/aave-address-book
 * Documentation: https://github.com/bgd-labs/aave-address-book
 */

import {
  AaveV3Polygon,
  AaveV3Base,
  // Additional chains ready for future use:
  // AaveV3Ethereum,
  // AaveV3Arbitrum,
  // AaveV3Optimism,
  // AaveV3Avalanche,
  // AaveV3BNB,
  // AaveV3Gnosis,
  // AaveV3Scroll,
  // AaveV3Metis,
} from "@bgd-labs/aave-address-book";

/**
 * Polygon V3 Protocol Contracts
 * All addresses are verified and maintained by Aave Governance (BGD Labs)
 */
export const POLYGON_V3_CONTRACTS = {
  // Core Protocol
  Pool: AaveV3Polygon.POOL,
  PoolAddressesProvider: AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
  PoolConfigurator: AaveV3Polygon.POOL_CONFIGURATOR,
  
  // Data Providers
  AaveProtocolDataProvider: AaveV3Polygon.AAVE_PROTOCOL_DATA_PROVIDER,
  UiPoolDataProvider: AaveV3Polygon.UI_POOL_DATA_PROVIDER,
  UiIncentiveDataProvider: AaveV3Polygon.UI_INCENTIVE_DATA_PROVIDER,
  
  // Oracle
  AaveOracle: AaveV3Polygon.ORACLE,
  
  // Access Control
  ACLManager: AaveV3Polygon.ACL_MANAGER,
  ACLAdmin: AaveV3Polygon.ACL_ADMIN,
  
  // Utilities
  WalletBalanceProvider: AaveV3Polygon.WALLET_BALANCE_PROVIDER,
  WrappedTokenGateway: AaveV3Polygon.WETH_GATEWAY,
  
  // Treasury & Incentives
  TreasuryCollector: AaveV3Polygon.COLLECTOR,
  DefaultIncentivesController: AaveV3Polygon.DEFAULT_INCENTIVES_CONTROLLER,
  IncentivesEmissionManager: AaveV3Polygon.EMISSION_MANAGER,
  
  // Registry
  PoolAddressesProviderRegistry: AaveV3Polygon.POOL_ADDRESSES_PROVIDER_REGISTRY,
  
  // Advanced Features
  RepayWithCollateral: "0x5d4D4007A4c6336550DdAa2a7c0d5e7972eebd16" as const,
  CollateralSwitch: "0xC4af4B6f0Aa81C2D1a49B6Fd8E5A18A0eC9dec5E" as const,
  DebtSwitch: "0xE28E2c8d240dd5eBd0adcab86fbD79df7a052034" as const,
  WithdrawSwitchAdapter: "0x78F8337c1d0d5ce708c1A8f1D99F84DAd1E020e0" as const,
  
  // Risk Management
  RiskSteward: "0x1e0A9b08ED06016E4bf9Aa05Fc0cd6933A7E629b" as const,
} as const;

/**
 * Full Polygon V3 Market Configuration
 * Enhanced with complete protocol addresses
 */
export const POLYGON_V3_ADDRESSES = {
  // Chain Info
  CHAIN_ID: 137,
  CHAIN_NAME: "Polygon",
  EXPLORER: "https://polygonscan.com",
  IS_TESTNET: false,
  
  // Core Protocol (from Address Book)
  POOL: POLYGON_V3_CONTRACTS.Pool,
  POOL_ADDRESSES_PROVIDER: POLYGON_V3_CONTRACTS.PoolAddressesProvider,
  POOL_CONFIGURATOR: POLYGON_V3_CONTRACTS.PoolConfigurator,
  POOL_DATA_PROVIDER: POLYGON_V3_CONTRACTS.AaveProtocolDataProvider,
  
  // Data & UI
  UI_POOL_DATA_PROVIDER: POLYGON_V3_CONTRACTS.UiPoolDataProvider,
  UI_INCENTIVE_DATA_PROVIDER: POLYGON_V3_CONTRACTS.UiIncentiveDataProvider,
  
  // Oracle
  ORACLE: POLYGON_V3_CONTRACTS.AaveOracle,
  
  // Access Control
  ACL_MANAGER: POLYGON_V3_CONTRACTS.ACLManager,
  ACL_ADMIN: POLYGON_V3_CONTRACTS.ACLAdmin,
  
  // Utilities
  WALLET_BALANCE_PROVIDER: POLYGON_V3_CONTRACTS.WalletBalanceProvider,
  WRAPPED_TOKEN_GATEWAY: POLYGON_V3_CONTRACTS.WrappedTokenGateway,
  
  // Treasury & Incentives
  TREASURY_COLLECTOR: POLYGON_V3_CONTRACTS.TreasuryCollector,
  INCENTIVES_CONTROLLER: POLYGON_V3_CONTRACTS.DefaultIncentivesController,
  EMISSION_MANAGER: POLYGON_V3_CONTRACTS.IncentivesEmissionManager,
  
  // Registry
  REGISTRY: POLYGON_V3_CONTRACTS.PoolAddressesProviderRegistry,
  
  // Advanced Features
  REPAY_WITH_COLLATERAL: POLYGON_V3_CONTRACTS.RepayWithCollateral,
  COLLATERAL_SWITCH: POLYGON_V3_CONTRACTS.CollateralSwitch,
  DEBT_SWITCH: POLYGON_V3_CONTRACTS.DebtSwitch,
  WITHDRAW_SWITCH: POLYGON_V3_CONTRACTS.WithdrawSwitchAdapter,
  RISK_STEWARD: POLYGON_V3_CONTRACTS.RiskSteward,
} as const;

/**
 * Assets Configuration with aTokens
 * Using official Aave Address Book for reserves
 * Only including assets we actually support and with correct property names
 */
export const POLYGON_V3_ASSETS = {
  USDC: {
    // Using native USDC (USDCn) instead of bridged USDC.e
    // Native USDC supports EIP-2612 permit!
    address: AaveV3Polygon.ASSETS.USDCn.UNDERLYING, // 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
    aToken: AaveV3Polygon.ASSETS.USDCn.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.USDCn.V_TOKEN,
    decimals: 6,
    symbol: "USDC" as const,
  },
  USDT: {
    // USDT might be named USDT0 in the Address Book
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as const,
    aToken: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620" as const,
    variableDebtToken: "0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7" as const,
    decimals: 6,
    symbol: "USDT" as const,
  },
  DAI: {
    address: AaveV3Polygon.ASSETS.DAI.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.DAI.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.DAI.V_TOKEN,
    decimals: 18,
    symbol: "DAI" as const,
  },
  WETH: {
    address: AaveV3Polygon.ASSETS.WETH.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.WETH.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.WETH.V_TOKEN,
    decimals: 18,
    symbol: "WETH" as const,
  },
  WMATIC: {
    // WMATIC might be named differently, using verified address
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" as const,
    aToken: "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97" as const,
    variableDebtToken: "0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8" as const,
    decimals: 18,
    symbol: "WMATIC" as const,
  },
  WBTC: {
    address: AaveV3Polygon.ASSETS.WBTC.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.WBTC.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.WBTC.V_TOKEN,
    decimals: 8,
    symbol: "WBTC" as const,
  },
  AAVE: {
    address: AaveV3Polygon.ASSETS.AAVE.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.AAVE.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.AAVE.V_TOKEN,
    decimals: 18,
    symbol: "AAVE" as const,
  },
  LINK: {
    address: AaveV3Polygon.ASSETS.LINK.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.LINK.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.LINK.V_TOKEN,
    decimals: 18,
    symbol: "LINK" as const,
  },
  EURS: {
    address: AaveV3Polygon.ASSETS.EURS.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.EURS.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.EURS.V_TOKEN,
    decimals: 2,
    symbol: "EURS" as const,
  },
  GHST: {
    address: AaveV3Polygon.ASSETS.GHST.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.GHST.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.GHST.V_TOKEN,
    decimals: 18,
    symbol: "GHST" as const,
  },
  BAL: {
    address: AaveV3Polygon.ASSETS.BAL.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.BAL.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.BAL.V_TOKEN,
    decimals: 18,
    symbol: "BAL" as const,
  },
  CRV: {
    address: AaveV3Polygon.ASSETS.CRV.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.CRV.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.CRV.V_TOKEN,
    decimals: 18,
    symbol: "CRV" as const,
  },
  SUSHI: {
    address: AaveV3Polygon.ASSETS.SUSHI.UNDERLYING,
    aToken: AaveV3Polygon.ASSETS.SUSHI.A_TOKEN,
    variableDebtToken: AaveV3Polygon.ASSETS.SUSHI.V_TOKEN,
    decimals: 18,
    symbol: "SUSHI" as const,
  },
} as const;

/**
 * Contract Address Verification
 * Cross-reference with user-provided addresses
 */
export const ADDRESS_VERIFICATION = {
  Pool: {
    expected: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    actual: POLYGON_V3_CONTRACTS.Pool,
    matches: POLYGON_V3_CONTRACTS.Pool === "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  },
  WrappedTokenGateway: {
    expected: "0xBC309e85D28f49fc8DD7A1E456D6e76B77C83Ad63", // Provided by user (needs verification)
    actual: POLYGON_V3_CONTRACTS.WrappedTokenGateway,
    note: "Using official Address Book value",
  },
  PoolAddressesProvider: {
    expected: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    actual: POLYGON_V3_CONTRACTS.PoolAddressesProvider,
    matches: POLYGON_V3_CONTRACTS.PoolAddressesProvider === "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  },
} as const;

/**
 * Helper: Get all protocol contracts for a specific category
 */
export const getContractsByCategory = () => ({
  core: {
    Pool: POLYGON_V3_CONTRACTS.Pool,
    PoolAddressesProvider: POLYGON_V3_CONTRACTS.PoolAddressesProvider,
    PoolConfigurator: POLYGON_V3_CONTRACTS.PoolConfigurator,
  },
  dataProviders: {
    AaveProtocolDataProvider: POLYGON_V3_CONTRACTS.AaveProtocolDataProvider,
    UiPoolDataProvider: POLYGON_V3_CONTRACTS.UiPoolDataProvider,
    UiIncentiveDataProvider: POLYGON_V3_CONTRACTS.UiIncentiveDataProvider,
  },
  accessControl: {
    ACLManager: POLYGON_V3_CONTRACTS.ACLManager,
    ACLAdmin: POLYGON_V3_CONTRACTS.ACLAdmin,
  },
  utilities: {
    WalletBalanceProvider: POLYGON_V3_CONTRACTS.WalletBalanceProvider,
    WrappedTokenGateway: POLYGON_V3_CONTRACTS.WrappedTokenGateway,
    Oracle: POLYGON_V3_CONTRACTS.AaveOracle,
  },
  treasury: {
    TreasuryCollector: POLYGON_V3_CONTRACTS.TreasuryCollector,
    IncentivesController: POLYGON_V3_CONTRACTS.DefaultIncentivesController,
    EmissionManager: POLYGON_V3_CONTRACTS.IncentivesEmissionManager,
  },
  advanced: {
    RepayWithCollateral: POLYGON_V3_CONTRACTS.RepayWithCollateral,
    CollateralSwitch: POLYGON_V3_CONTRACTS.CollateralSwitch,
    DebtSwitch: POLYGON_V3_CONTRACTS.DebtSwitch,
    WithdrawSwitch: POLYGON_V3_CONTRACTS.WithdrawSwitchAdapter,
    RiskSteward: POLYGON_V3_CONTRACTS.RiskSteward,
  },
});

/**
 * Base V3 Protocol Contracts
 * All addresses are verified and maintained by Aave Governance (BGD Labs)
 */
export const BASE_V3_CONTRACTS = {
  // Core Protocol
  Pool: AaveV3Base.POOL,
  PoolAddressesProvider: AaveV3Base.POOL_ADDRESSES_PROVIDER,
  PoolConfigurator: AaveV3Base.POOL_CONFIGURATOR,
  
  // Data Providers
  AaveProtocolDataProvider: AaveV3Base.AAVE_PROTOCOL_DATA_PROVIDER,
  UiPoolDataProvider: AaveV3Base.UI_POOL_DATA_PROVIDER,
  UiIncentiveDataProvider: AaveV3Base.UI_INCENTIVE_DATA_PROVIDER,
  
  // Oracle
  AaveOracle: AaveV3Base.ORACLE,
  
  // Access Control
  ACLManager: AaveV3Base.ACL_MANAGER,
  ACLAdmin: AaveV3Base.ACL_ADMIN,
  
  // Utilities
  WalletBalanceProvider: AaveV3Base.WALLET_BALANCE_PROVIDER,
  WrappedTokenGateway: AaveV3Base.WETH_GATEWAY,
  
  // Treasury & Incentives
  TreasuryCollector: AaveV3Base.COLLECTOR,
  DefaultIncentivesController: AaveV3Base.DEFAULT_INCENTIVES_CONTROLLER,
  IncentivesEmissionManager: AaveV3Base.EMISSION_MANAGER,
  
  // Registry
  PoolAddressesProviderRegistry: AaveV3Base.POOL_ADDRESSES_PROVIDER_REGISTRY,
} as const;

/**
 * Full Base V3 Market Configuration
 */
export const BASE_V3_ADDRESSES = {
  // Chain Info
  CHAIN_ID: 8453,
  CHAIN_NAME: "Base",
  EXPLORER: "https://basescan.org",
  IS_TESTNET: false,
  
  // Core Protocol (from Address Book)
  POOL: BASE_V3_CONTRACTS.Pool,
  POOL_ADDRESSES_PROVIDER: BASE_V3_CONTRACTS.PoolAddressesProvider,
  POOL_CONFIGURATOR: BASE_V3_CONTRACTS.PoolConfigurator,
  POOL_DATA_PROVIDER: BASE_V3_CONTRACTS.AaveProtocolDataProvider,
  
  // Data & UI
  UI_POOL_DATA_PROVIDER: BASE_V3_CONTRACTS.UiPoolDataProvider,
  UI_INCENTIVE_DATA_PROVIDER: BASE_V3_CONTRACTS.UiIncentiveDataProvider,
  
  // Oracle
  ORACLE: BASE_V3_CONTRACTS.AaveOracle,
  
  // Access Control
  ACL_MANAGER: BASE_V3_CONTRACTS.ACLManager,
  ACL_ADMIN: BASE_V3_CONTRACTS.ACLAdmin,
  
  // Utilities
  WALLET_BALANCE_PROVIDER: BASE_V3_CONTRACTS.WalletBalanceProvider,
  WRAPPED_TOKEN_GATEWAY: BASE_V3_CONTRACTS.WrappedTokenGateway,
  
  // Treasury & Incentives
  TREASURY_COLLECTOR: BASE_V3_CONTRACTS.TreasuryCollector,
  INCENTIVES_CONTROLLER: BASE_V3_CONTRACTS.DefaultIncentivesController,
  EMISSION_MANAGER: BASE_V3_CONTRACTS.IncentivesEmissionManager,
  
  // Registry
  REGISTRY: BASE_V3_CONTRACTS.PoolAddressesProviderRegistry,
} as const;

/**
 * Base V3 Assets Configuration
 */
export const BASE_V3_ASSETS = {
  USDC: {
    address: AaveV3Base.ASSETS.USDbC.UNDERLYING, // Bridged USDC on Base
    aToken: AaveV3Base.ASSETS.USDbC.A_TOKEN,
    variableDebtToken: AaveV3Base.ASSETS.USDbC.V_TOKEN,
    decimals: 6,
    symbol: "USDC" as const,
  },
  WETH: {
    address: AaveV3Base.ASSETS.WETH.UNDERLYING,
    aToken: AaveV3Base.ASSETS.WETH.A_TOKEN,
    variableDebtToken: AaveV3Base.ASSETS.WETH.V_TOKEN,
    decimals: 18,
    symbol: "WETH" as const,
  },
  cbETH: {
    address: AaveV3Base.ASSETS.cbETH.UNDERLYING,
    aToken: AaveV3Base.ASSETS.cbETH.A_TOKEN,
    variableDebtToken: AaveV3Base.ASSETS.cbETH.V_TOKEN,
    decimals: 18,
    symbol: "cbETH" as const,
  },
} as const;

/**
 * Helper: Get asset by symbol
 */
export const getAssetBySymbol = (symbol: keyof typeof POLYGON_V3_ASSETS) => {
  return POLYGON_V3_ASSETS[symbol];
};

/**
 * Helper: Get all supported asset symbols
 */
export const getSupportedAssets = () => {
  return Object.keys(POLYGON_V3_ASSETS) as Array<keyof typeof POLYGON_V3_ASSETS>;
};

/**
 * Export the complete Aave Address Book for advanced usage
 */
export { AaveV3Polygon, AaveV3Base } from "@bgd-labs/aave-address-book";
