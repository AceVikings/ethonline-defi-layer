/**
 * Aave V3 Subgraph Data Fetching
 * Uses Aave's official subgraph to fetch real-time market data
 * This avoids the ethers.js dependency issue with @aave/contract-helpers
 */

export interface AaveReserveData {
  symbol: string;
  name: string;
  underlyingAsset: string;
  aTokenAddress: string;
  decimals: number;
  supplyAPY: string;
  variableBorrowAPY: string;
  availableLiquidity: string;
  totalLiquidity: string;
  utilizationRate: string;
  supplyCap: string;
  borrowCap: string;
  isFrozen: boolean;
  isPaused: boolean;
  isActive: boolean;
}

// Subgraph endpoints for different chains
const SUBGRAPH_URLS: Record<number, string> = {
  1: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3",
  137: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon",
  8453: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-base",
  42161: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum",
  10: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism",
  43114: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-avalanche",
  100: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3-gnosis",
};

const RESERVES_QUERY = `
  query GetReserves {
    reserves(first: 100, where: { isActive: true }) {
      id
      symbol
      name
      decimals
      underlyingAsset
      aToken {
        id
      }
      liquidityRate
      variableBorrowRate
      availableLiquidity
      totalLiquidity
      utilizationRate
      supplyCap
      borrowCap
      isFrozen
      isPaused
      isActive
    }
  }
`;

/**
 * Fetch reserves data from Aave subgraph
 */
export async function fetchAaveReservesFromSubgraph(
  chainId: number
): Promise<Record<string, AaveReserveData>> {
  const subgraphUrl = SUBGRAPH_URLS[chainId];
  if (!subgraphUrl) {
    console.warn(`No subgraph URL for chain ${chainId}, using mock data`);
    return getMockReservesData();
  }

  try {
    const response = await fetch(subgraphUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: RESERVES_QUERY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Subgraph request failed: ${response.statusText}`);
    }

    const { data, errors } = await response.json();

    if (errors) {
      console.error("Subgraph errors:", errors);
      throw new Error(`Subgraph query failed: ${errors[0]?.message}`);
    }

    const reserves: Record<string, AaveReserveData> = {};

    data.reserves.forEach((reserve: any) => {
      // Convert liquidity rate to APY percentage
      // Aave rates are in RAY units (1e27), need to convert to percentage
      const liquidityRate = parseFloat(reserve.liquidityRate) / 1e27;
      const variableBorrowRate = parseFloat(reserve.variableBorrowRate) / 1e27;

      // Calculate APY from APR using compound interest formula
      // APY = (1 + APR/SECONDS_PER_YEAR)^SECONDS_PER_YEAR - 1
      const SECONDS_PER_YEAR = 31536000;
      const supplyAPY = (Math.pow(1 + liquidityRate / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;
      const borrowAPY = (Math.pow(1 + variableBorrowRate / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;

      reserves[reserve.symbol] = {
        symbol: reserve.symbol,
        name: reserve.name,
        underlyingAsset: reserve.underlyingAsset,
        aTokenAddress: reserve.aToken.id,
        decimals: parseInt(reserve.decimals),
        supplyAPY: supplyAPY.toFixed(2),
        variableBorrowAPY: borrowAPY.toFixed(2),
        availableLiquidity: (parseFloat(reserve.availableLiquidity) / Math.pow(10, reserve.decimals)).toFixed(2),
        totalLiquidity: (parseFloat(reserve.totalLiquidity) / Math.pow(10, reserve.decimals)).toFixed(2),
        utilizationRate: (parseFloat(reserve.utilizationRate) * 100).toFixed(2),
        supplyCap: reserve.supplyCap || "0",
        borrowCap: reserve.borrowCap || "0",
        isFrozen: reserve.isFrozen,
        isPaused: reserve.isPaused,
        isActive: reserve.isActive,
      };
    });

    return reserves;
  } catch (error) {
    console.error(`Error fetching from Aave subgraph for chain ${chainId}:`, error);
    // Return mock data as fallback
    return getMockReservesData();
  }
}

/**
 * Mock data fallback for when subgraph is unavailable
 */
function getMockReservesData(): Record<string, AaveReserveData> {
  return {
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      underlyingAsset: "0x",
      aTokenAddress: "0x",
      decimals: 6,
      supplyAPY: "4.25",
      variableBorrowAPY: "5.50",
      availableLiquidity: "1000000",
      totalLiquidity: "5000000",
      utilizationRate: "80.00",
      supplyCap: "0",
      borrowCap: "0",
      isFrozen: false,
      isPaused: false,
      isActive: true,
    },
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      underlyingAsset: "0x",
      aTokenAddress: "0x",
      decimals: 6,
      supplyAPY: "5.10",
      variableBorrowAPY: "6.20",
      availableLiquidity: "800000",
      totalLiquidity: "4000000",
      utilizationRate: "75.00",
      supplyCap: "0",
      borrowCap: "0",
      isFrozen: false,
      isPaused: false,
      isActive: true,
    },
    DAI: {
      symbol: "DAI",
      name: "Dai Stablecoin",
      underlyingAsset: "0x",
      aTokenAddress: "0x",
      decimals: 18,
      supplyAPY: "3.80",
      variableBorrowAPY: "4.90",
      availableLiquidity: "500000",
      totalLiquidity: "2500000",
      utilizationRate: "70.00",
      supplyCap: "0",
      borrowCap: "0",
      isFrozen: false,
      isPaused: false,
      isActive: true,
    },
  };
}
