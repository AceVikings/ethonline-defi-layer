import { useAccount, useChainId } from "wagmi";
import { TrendingUp, Info } from "lucide-react";
import { useNetwork } from "../contexts/NetworkContext";
import { useAaveMarketData } from "../hooks/useAaveMarketData";
import { useAaveUserPosition } from "../hooks/useAaveUserPosition";
import { useAaveUserSupplies } from "../hooks/useAaveUserSupplies";
import { AaveTokenCard } from "./AaveTokenCard";
import { getAaveConfigByChainId } from "../config/aave";

const CHAIN_INFO = {
  137: { // Polygon
    name: "Polygon",
    icon: "https://statics.aave.com/polygon.svg",
    color: "#8247E5",
  },
  8453: { // Base
    name: "Base",
    icon: "https://cryptologos.cc/logos/coinbase-coin-logo.svg",
    color: "#0052FF",
  },
  11155111: { // Sepolia
    name: "Sepolia",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    color: "#627EEA",
  },
} as const;

interface AaveYieldProps {
  className?: string;
}

export function AaveYield({ className = "" }: AaveYieldProps) {
  const { networkMode } = useNetwork();
  const { address } = useAccount();
  const chainId = useChainId();
  
  // Get Aave config based on connected chain
  const AAVE_CONFIG = getAaveConfigByChainId(chainId);

  // Fetch real-time market data from Aave using official @aave/react SDK
  const {
    reserves: reservesData,
    loading: loadingMarketData,
    error: marketDataError,
  } = useAaveMarketData(AAVE_CONFIG.CHAIN_ID, address);

  // Fetch user's Aave position (collateral, debt, health factor)
  const { position: userPosition } = useAaveUserPosition(
    AAVE_CONFIG.CHAIN_ID,
    address
  );

  // Fetch user's supplied positions (accurate per-token supplied amounts)
  const { supplies: userSupplies } = useAaveUserSupplies(
    AAVE_CONFIG.CHAIN_ID,
    address
  );

  // Debug log to verify supplied amounts
  if (address && Object.keys(userSupplies).length > 0) {
    console.log("User Supplies (from useUserSupplies hook):", userSupplies);
  }

  // Get chain info based on connected chain
  const chainInfo = CHAIN_INFO[chainId as keyof typeof CHAIN_INFO] || CHAIN_INFO[137];

  // Get all available markets (all reserves that are active) sorted by APY (highest first)
  const availableMarkets = Object.values(reservesData)
    .filter((reserve) => reserve.isActive)
    .sort((a, b) => {
      const apyA = parseFloat(a.supplyAPY) || 0;
      const apyB = parseFloat(b.supplyAPY) || 0;
      return apyB - apyA; // Descending order (highest APY first)
    });

  // Get available liquidity for a token
  const getAvailableLiquidity = (liquidity: string): string => {
    const value = parseFloat(liquidity);
    if (value > 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value > 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border-2 border-neon-violet/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-neon-violet" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-off-white">
                Aave V3 Yield
              </h3>
              <p className="text-sm text-soft-gray">
                Supply tokens to earn interest or withdraw your funds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card border border-neon-violet/20">
            <img src={chainInfo.icon} alt={chainInfo.name} className="w-5 h-5 object-contain" />
            <span className="text-sm font-medium text-off-white">{chainInfo.name}</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {chainId === 11155111 ? (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-500 font-semibold mb-1">
                Testnet Limitation
              </p>
              <p className="text-yellow-400/80">
                Aave V3 Sepolia pools have supply caps. If your transaction
                fails with "SUPPLY_CAP_EXCEEDED", try a smaller amount or switch
                between USDC/USDT.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-aqua-blue/10 border border-aqua-blue/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-aqua-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-aqua-blue font-semibold mb-1">
                {chainInfo.name} Network
              </p>
              <p className="text-aqua-blue/80">
                You're connected to {chainInfo.name}. Real funds and gas fees apply.
                {chainId === 137 && " You can bridge from any chain using the buttons below."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Position Summary (if user has supplied/borrowed) */}
      {address && userPosition && userPosition.hasPositions && (
        <div className="p-5 rounded-xl glass-card border-2 border-neon-violet/30 bg-gradient-to-br from-neon-violet/5 to-transparent">
          <h4 className="text-sm font-semibold text-off-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neon-violet" />
            Your Aave Position
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-soft-gray mb-1">
                Total Collateral
              </div>
              <div className="text-lg font-bold text-aqua-blue">
                ${parseFloat(userPosition.totalCollateralUSD).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Total Debt</div>
              <div className="text-lg font-bold text-off-white">
                ${parseFloat(userPosition.totalDebtUSD).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">
                Available to Borrow
              </div>
              <div className="text-lg font-bold text-off-white">
                ${parseFloat(userPosition.availableBorrowsUSD).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Health Factor</div>
              <div
                className={`text-lg font-bold ${
                  parseFloat(userPosition.healthFactor) > 2
                    ? "text-green-400"
                    : parseFloat(userPosition.healthFactor) > 1.5
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {parseFloat(userPosition.healthFactor) > 0
                  ? parseFloat(userPosition.healthFactor).toFixed(2)
                  : "∞"}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Current LTV</div>
              <div className="text-lg font-bold text-off-white">
                {(parseFloat(userPosition.ltv) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">
                Liquidation Threshold
              </div>
              <div className="text-lg font-bold text-off-white">
                {(
                  parseFloat(userPosition.currentLiquidationThreshold) * 100
                ).toFixed(2)}
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {marketDataError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-red-500 text-sm">
            Error loading market data. Please try again.
          </p>
        </div>
      )}

      {/* Token Cards Grid - Show all available markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {availableMarkets.map((reserve) => (
          <AaveTokenCard
            key={reserve.symbol}
            token={reserve.symbol}
            tokenName={reserve.name}
            tokenLogo={reserve.tokenLogo}
            networkMode={networkMode}
            targetChainId={chainId} // Pass the actual connected chain ID
            chainIcon={chainInfo.icon}
            chainName={chainInfo.name}
            chainColor={chainInfo.color}
            apy={reserve.supplyAPY}
            availableLiquidity={getAvailableLiquidity(
              reserve.availableLiquidity
            )}
            userBalance={reserve.suppliable}
            userATokenBalance={
              userSupplies[reserve.symbol]?.suppliedAmount || "0"
            }
            aTokenAddress={reserve.aTokenAddress}
            underlyingAsset={reserve.underlyingAsset}
            decimals={reserve.decimals}
            loading={loadingMarketData}
            showBridgeSupply={reserve.symbol === "USDC"}
          />
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card border border-aqua-blue/20">
          <div className="text-sm text-soft-gray mb-1">Total Markets</div>
          <div className="text-2xl font-bold text-aqua-blue">
            {availableMarkets.length}
          </div>
          <div className="text-xs text-soft-gray mt-1">Active reserves</div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-neon-violet/20">
          <div className="text-sm text-soft-gray mb-1">Protocol</div>
          <div className="text-2xl font-bold text-neon-violet">Aave V3</div>
          <div className="text-xs text-soft-gray mt-1">
            Decentralized lending
          </div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-soft-gray/20">
          <div className="text-sm text-soft-gray mb-1">Network</div>
          <div className="text-2xl font-bold text-off-white flex items-center gap-2">
            <img
              src={chainInfo.icon}
              alt={chainInfo.name}
              className="w-6 h-6"
            />
            <span>{chainInfo.name}</span>
          </div>
          <div className="text-xs text-soft-gray mt-1">
            Chain ID: {AAVE_CONFIG.CHAIN_ID}
          </div>
        </div>
      </div>
    </div>
  );
}
