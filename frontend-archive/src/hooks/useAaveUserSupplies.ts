/**
 * Hook to fetch user's supplied positions per reserve
 * Uses @aave/react SDK's useUserSupplies hook
 */

import {
  useUserSupplies,
  evmAddress,
  chainId as aaveChainId,
} from "@aave/react";

export interface UserSupplyPosition {
  symbol: string;
  suppliedAmount: string;
  suppliedUSD: string;
  aTokenAddress: string;
}

export interface UseAaveUserSuppliesResult {
  supplies: Record<string, UserSupplyPosition>;
  loading: boolean;
  error: Error | null;
}

const AAVE_POOL_ADDRESSES: Record<number, string> = {
  137: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Polygon V3 Pool
  8453: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Base V3 Pool
  1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Ethereum V3 Pool
  11155111: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Sepolia V3 Pool
};

/**
 * Hook to fetch user's supplied positions
 */
export function useAaveUserSupplies(
  chainIdNum: number,
  userAddress?: string
): UseAaveUserSuppliesResult {
  const poolAddress = AAVE_POOL_ADDRESSES[chainIdNum];
  console.log("Using pool address:", poolAddress);
  const { data, loading, error } = useUserSupplies({
    markets:
      poolAddress && userAddress
        ? [
            {
              address: evmAddress(poolAddress),
              chainId: aaveChainId(chainIdNum),
            },
          ]
        : [],
    user: userAddress
      ? evmAddress(userAddress)
      : evmAddress("0x0000000000000000000000000000000000000000"),
  });

  // Transform to a symbol-keyed map
  const supplies: Record<string, UserSupplyPosition> = {};

  if (data && Array.isArray(data)) {
    console.log("User supplies data:", data);
    data.forEach((position: any) => {
      // The correct path is currency.symbol based on the API response structure
      const symbol = position.currency?.symbol;
      if (symbol) {
        supplies[symbol] = {
          symbol,
          suppliedAmount: position.balance?.amount?.value || "0",
          suppliedUSD: position.balance?.usd || "0",
          aTokenAddress: position.currency?.address || "",
        };
      }
    });
    console.log("Processed supplies:", supplies);
  }

  return {
    supplies,
    loading: !!userAddress && loading,
    error: error || null,
  };
}
