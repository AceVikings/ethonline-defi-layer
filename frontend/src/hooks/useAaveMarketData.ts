/**
 * Custom hook for fetching Aave market data
 * Uses @aave/react SDK for accurate, real-time market information
 */

import { useState, useEffect } from "react";
import { useAaveMarket, chainId as aaveChainId, evmAddress } from "@aave/react";

// Aave V3 Pool (Market) addresses - NOT Pool Addresses Provider
const AAVE_POOL_ADDRESSES: Record<number, string> = {
  137: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Polygon V3 Pool
  1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Ethereum V3 Pool
  11155111: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Sepolia V3 Pool
};

export interface AaveReserveInfo {
  symbol: string;
  name: string;
  supplyAPY: string;
  variableBorrowAPY: string;
  totalLiquidity: string;
  availableLiquidity: string;
  utilizationRate: string;
  isActive: boolean;
  aTokenAddress?: string;
  underlyingAsset?: string;
  tokenLogo?: string;
  suppliable?: string;
  userBalance?: string;
  decimals?: number;
}

export interface UseAaveMarketDataResult {
  reserves: Record<string, AaveReserveInfo>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch Aave market data for a specific chain
 */
export function useAaveMarketData(
  chainIdNum: number,
  userAddress?: string
): UseAaveMarketDataResult {
  const [reserves, setReserves] = useState<Record<string, AaveReserveInfo>>({});
  const [error, setError] = useState<Error | null>(null);

  const poolAddressProvider = AAVE_POOL_ADDRESSES[chainIdNum];

  // Don't call the hook if we don't have a pool address for this chain
  const shouldFetch = !!poolAddressProvider;

  const {
    data,
    loading,
    error: aaveError,
  } = useAaveMarket({
    address: poolAddressProvider
      ? evmAddress(poolAddressProvider)
      : evmAddress("0x0000000000000000000000000000000000000000"),
    chainId: aaveChainId(chainIdNum),
    user: userAddress ? evmAddress(userAddress) : undefined,
  });

  useEffect(() => {
    // If we don't have a pool address for this chain, set an error
    if (!shouldFetch) {
      setError(new Error(`Aave V3 not supported on chain ${chainIdNum}`));
      setReserves({});
      return;
    }

    if (aaveError) {
      console.error("Aave market data error:", aaveError);
      setError(aaveError);
      return;
    }

    if (!data) {
      return;
    }

    try {
      // Transform Aave SDK data to our format
      const reserveMap: Record<string, AaveReserveInfo> = {};

      // Combine supply and borrow reserves
      const allReserves = [...(data.supplyReserves || [])];

      console.log(
        `Processing ${allReserves.length} reserves from Aave SDK for chain ${chainIdNum}`
      );

      allReserves.forEach((reserve: any) => {
        // The actual field is underlyingToken, not underlyingAsset
        const symbol = reserve.underlyingToken?.symbol || reserve.symbol;

        if (!symbol) {
          console.warn("Reserve without symbol:", JSON.stringify(reserve));
          return;
        }

        // Extract APY from the nested structure: supplyInfo.apy.formatted
        const supplyAPY = reserve.supplyInfo?.apy?.formatted || 
                         reserve.supplyAPY || 
                         "0.00";
        
        const variableBorrowAPY = reserve.borrowInfo?.apy?.formatted || 
                                 reserve.variableBorrowAPY || 
                                 "0.00";
        
        // Extract liquidity from borrowInfo.availableLiquidity.amount.value
        const availableLiquidity = reserve.borrowInfo?.availableLiquidity?.amount?.value ||
                                  reserve.availableLiquidity?.toString() ||
                                  "0";
        
        const totalLiquidity = reserve.size?.amount?.value ||
                              reserve.totalLiquidity?.toString() ||
                              "0";
        
        const utilizationRate = reserve.borrowInfo?.utilizationRate?.formatted ||
                               reserve.utilizationRate ||
                               "0.00";
        
        // Log user state for debugging
        console.log(`${symbol} userState:`, {
          suppliable: reserve.userState?.suppliable?.amount?.value,
          balance: reserve.userState?.balance?.amount?.value,
        });

        reserveMap[symbol] = {
          symbol,
          name: reserve.underlyingToken?.name || symbol,
          supplyAPY,
          variableBorrowAPY,
          totalLiquidity,
          availableLiquidity,
          utilizationRate,
          isActive: !reserve.isFrozen && !reserve.isPaused,
          aTokenAddress: reserve.aToken?.address || reserve.aTokenAddress,
          underlyingAsset: reserve.underlyingToken?.address || reserve.underlyingToken,
          tokenLogo: reserve.underlyingToken?.imageUrl,
          // suppliable = amount user can supply (wallet balance)
          suppliable: reserve.userState?.suppliable?.amount?.value || "0",
          // userBalance = amount user has already supplied (aToken/supplied balance)
          userBalance: reserve.userState?.balance?.amount?.value || "0",
          decimals: reserve.underlyingToken?.decimals || 18,
        };
      });

      console.log("Processed reserves:", Object.keys(reserveMap));
      setReserves(reserveMap);
      setError(null);
    } catch (err) {
      console.error("Error processing Aave market data:", err);
      setError(err as Error);
    }
  }, [data, aaveError, chainIdNum, shouldFetch]);

  return {
    reserves,
    loading: shouldFetch ? loading : false,
    error,
  };
}
