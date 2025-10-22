/**
 * Hook to fetch Compound V3 market data
 * Fetches supply/borrow rates, utilization, and asset info
 */

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { getCompoundConfigByChainId, COMET_ABI } from "../config/compound";

export interface CompoundAssetInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isBaseAsset: boolean;
  borrowCollateralFactor?: string; // As percentage
  liquidateCollateralFactor?: string; // As percentage
  supplyCap?: string;
  logo?: string;
}

export interface CompoundMarketData {
  supplyAPY: string;
  borrowAPY: string;
  utilization: string;
  totalSupply: string;
  totalBorrow: string;
  baseAsset: CompoundAssetInfo;
  collateralAssets: CompoundAssetInfo[];
}

export interface UseCompoundMarketDataResult {
  marketData: CompoundMarketData | null;
  loading: boolean;
  error: Error | null;
}

const SECONDS_PER_YEAR = 60 * 60 * 24 * 365;

// Token logos
const TOKEN_LOGOS: Record<string, string> = {
  USDC: "https://token-logos.family.co/asset?id=137:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  WETH: "https://token-logos.family.co/asset?id=137:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  WBTC: "https://token-logos.family.co/asset?id=137:0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
  WMATIC: "https://token-logos.family.co/asset?id=137:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  cbETH: "https://ethereum-optimism.github.io/data/cbETH/logo.svg",
  wstETH: "https://ethereum-optimism.github.io/data/wstETH/logo.svg",
  stMATIC: "https://ethereum-optimism.github.io/data/stMATIC/logo.svg",
  MaticX: "https://ethereum-optimism.github.io/data/MATICX/logo.svg",
};

export function useCompoundMarketData(
  chainId: number
): UseCompoundMarketDataResult {
  const [marketData, setMarketData] = useState<CompoundMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const COMPOUND_CONFIG = getCompoundConfigByChainId(chainId);

  // Get utilization
  const { data: utilization } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "getUtilization",
  });

  // Get supply rate
  const { data: supplyRate } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "getSupplyRate",
    args: utilization ? [utilization] : undefined,
    query: {
      enabled: !!utilization,
    },
  });

  // Get borrow rate
  const { data: borrowRate } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "getBorrowRate",
    args: utilization ? [utilization] : undefined,
    query: {
      enabled: !!utilization,
    },
  });

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "totalSupply",
  });

  // Get total borrow
  const { data: totalBorrow } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "totalBorrow",
  });

  // Get number of assets
  const { data: numAssets } = useReadContract({
    address: COMPOUND_CONFIG.COMET as `0x${string}`,
    abi: COMET_ABI,
    functionName: "numAssets",
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);

        // Calculate APY from rates
        const supplyAPY = supplyRate
          ? (
              (Number(supplyRate) / 1e18) *
              SECONDS_PER_YEAR *
              100
            ).toFixed(2)
          : "0";

        const borrowAPY = borrowRate
          ? (
              (Number(borrowRate) / 1e18) *
              SECONDS_PER_YEAR *
              100
            ).toFixed(2)
          : "0";

        const utilizationPercent = utilization
          ? ((Number(utilization) / 1e18) * 100).toFixed(2)
          : "0";

        // Format total supply and borrow
        const totalSupplyFormatted = totalSupply
          ? (Number(totalSupply) / 10 ** COMPOUND_CONFIG.BASE_ASSET.decimals).toFixed(2)
          : "0";

        const totalBorrowFormatted = totalBorrow
          ? (Number(totalBorrow) / 10 ** COMPOUND_CONFIG.BASE_ASSET.decimals).toFixed(2)
          : "0";

        // Build base asset info
        const baseAsset: CompoundAssetInfo = {
          symbol: COMPOUND_CONFIG.BASE_ASSET.symbol,
          name: COMPOUND_CONFIG.BASE_ASSET.symbol,
          address: COMPOUND_CONFIG.BASE_ASSET.address,
          decimals: COMPOUND_CONFIG.BASE_ASSET.decimals,
          isBaseAsset: true,
          logo: TOKEN_LOGOS[COMPOUND_CONFIG.BASE_ASSET.symbol],
        };

        // Build collateral assets info
        const collateralAssets: CompoundAssetInfo[] = Object.values(
          COMPOUND_CONFIG.COLLATERAL_ASSETS
        ).map((asset) => ({
          symbol: asset.symbol,
          name: asset.symbol,
          address: asset.address,
          decimals: asset.decimals,
          isBaseAsset: false,
          logo: TOKEN_LOGOS[asset.symbol],
        }));

        const data: CompoundMarketData = {
          supplyAPY,
          borrowAPY,
          utilization: utilizationPercent,
          totalSupply: totalSupplyFormatted,
          totalBorrow: totalBorrowFormatted,
          baseAsset,
          collateralAssets,
        };

        setMarketData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching Compound market data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (utilization !== undefined) {
      fetchMarketData();
    }
  }, [
    chainId,
    utilization,
    supplyRate,
    borrowRate,
    totalSupply,
    totalBorrow,
    numAssets,
  ]);

  return { marketData, loading, error };
}
