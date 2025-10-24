/**
 * Custom hook for fetching user's Aave position data
 * Uses @aave/react SDK for user-specific data like supplies, borrows, and health factor
 */

import { useUserMarketState, chainId as aaveChainId, evmAddress } from '@aave/react';

// Aave V3 Pool (Market) addresses - NOT Pool Addresses Provider
const AAVE_POOL_ADDRESSES: Record<number, string> = {
  137: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Polygon V3 Pool
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Base V3 Pool
  1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',   // Ethereum V3 Pool
  11155111: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Sepolia V3 Pool
};

export interface UserAavePosition {
  totalCollateralUSD: string;
  totalDebtUSD: string;
  availableBorrowsUSD: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
  hasPositions: boolean;
}

export interface UseAaveUserPositionResult {
  position: UserAavePosition | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch user's Aave position for a specific chain
 */
export function useAaveUserPosition(
  chainIdNum: number,
  userAddress?: string
): UseAaveUserPositionResult {
  const poolAddressProvider = AAVE_POOL_ADDRESSES[chainIdNum];

  // Only fetch if we have both user address and pool address
  const shouldFetch = !!userAddress && !!poolAddressProvider;

  const { data, loading, error } = useUserMarketState({
    market: poolAddressProvider ? evmAddress(poolAddressProvider) : evmAddress('0x0000000000000000000000000000000000000000'),
    user: userAddress ? evmAddress(userAddress) : evmAddress('0x0000000000000000000000000000000000000000'),
    chainId: aaveChainId(chainIdNum),
  });

  if (!shouldFetch) {
    return {
      position: null,
      loading: false,
      error: userAddress ? new Error(`Aave V3 not supported on chain ${chainIdNum}`) : null,
    };
  }

  if (error) {
    console.error('Error fetching user Aave position:', error);
    return {
      position: null,
      loading: false,
      error,
    };
  }

  if (loading || !data) {
    return {
      position: null,
      loading: true,
      error: null,
    };
  }

  // Transform the data to our format
  const position: UserAavePosition = {
    totalCollateralUSD: data.totalCollateralBase?.toString() || '0',
    totalDebtUSD: data.totalDebtBase?.toString() || '0',
    availableBorrowsUSD: data.availableBorrowsBase?.toString() || '0',
    currentLiquidationThreshold: data.currentLiquidationThreshold?.formatted?.toString() || '0',
    ltv: data.ltv?.formatted?.toString() || '0',
    healthFactor: data.healthFactor?.toString() || '0',
    hasPositions: parseFloat(data.totalCollateralBase?.toString() || '0') > 0 || 
                  parseFloat(data.totalDebtBase?.toString() || '0') > 0,
  };

  return {
    position,
    loading: false,
    error: null,
  };
}
