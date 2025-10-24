import { useAccount, useChainId } from "wagmi";
import { TrendingUp, Info } from "lucide-react";
import { getCompoundConfigByChainId } from "../config/compound";
import { useCompoundMarketData } from "../hooks/useCompoundMarketData";
import { useCompoundUserPosition } from "../hooks/useCompoundUserPosition";
import { CompoundTokenCard } from "./CompoundTokenCard";

const CHAIN_INFO = {
  137: {
    // Polygon
    name: "Polygon",
    icon: "https://statics.aave.com/polygon.svg",
    color: "#8247E5",
  },
  8453: {
    // Base
    name: "Base",
    icon: "https://cryptologos.cc/logos/coinbase-coin-logo.svg",
    color: "#0052FF",
  },
} as const;

interface CompoundYieldProps {
  className?: string;
}

export function CompoundYield({ className = "" }: CompoundYieldProps) {
  const { address } = useAccount();
  const chainId = useChainId();

  // Get Compound config based on connected chain
  const COMPOUND_CONFIG = getCompoundConfigByChainId(chainId);

  // Fetch market data
  const {
    marketData,
    loading: loadingMarketData,
    error: marketDataError,
  } = useCompoundMarketData(chainId);

  // Fetch user position
  const { position: userPosition } = useCompoundUserPosition(chainId, address);

  // Get chain info
  const chainInfo =
    CHAIN_INFO[chainId as keyof typeof CHAIN_INFO] || CHAIN_INFO[8453];

  // Format large numbers
  const formatLargeNumber = (value: string): string => {
    const num = parseFloat(value);
    if (num > 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num > 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-off-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-aqua-blue" />
            Compound V3
          </h2>
          <p className="text-soft-gray mt-1">
            Supply assets to earn yield or use as collateral to borrow {COMPOUND_CONFIG.BASE_ASSET.symbol}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-aqua-blue/20">
          <img
            src={chainInfo.icon}
            alt={chainInfo.name}
            className="w-5 h-5 object-contain"
          />
          <span className="text-sm font-medium text-off-white">
            {chainInfo.name}
          </span>
        </div>
      </div>

      {/* Market Overview */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl glass-card border border-aqua-blue/20">
            <div className="text-xs text-soft-gray mb-1">Supply APY</div>
            <div className="text-2xl font-bold text-aqua-blue">
              {marketData.supplyAPY}%
            </div>
            <div className="text-xs text-soft-gray mt-1">
              Earn on {COMPOUND_CONFIG.BASE_ASSET.symbol}
            </div>
          </div>
          <div className="p-4 rounded-xl glass-card border border-neon-violet/20">
            <div className="text-xs text-soft-gray mb-1">Borrow APY</div>
            <div className="text-2xl font-bold text-neon-violet">
              {marketData.borrowAPY}%
            </div>
            <div className="text-xs text-soft-gray mt-1">
              Borrow {COMPOUND_CONFIG.BASE_ASSET.symbol}
            </div>
          </div>
          <div className="p-4 rounded-xl glass-card border border-electric-yellow/20">
            <div className="text-xs text-soft-gray mb-1">Total Supply</div>
            <div className="text-2xl font-bold text-electric-yellow">
              {formatLargeNumber(marketData.totalSupply)}
            </div>
            <div className="text-xs text-soft-gray mt-1">Protocol TVL</div>
          </div>
          <div className="p-4 rounded-xl glass-card border border-off-white/20">
            <div className="text-xs text-soft-gray mb-1">Utilization</div>
            <div className="text-2xl font-bold text-off-white">
              {marketData.utilization}%
            </div>
            <div className="text-xs text-soft-gray mt-1">Market efficiency</div>
          </div>
        </div>
      )}

      {/* User Position Summary */}
      {address && (
        <div className="p-6 rounded-xl glass-card border border-neon-violet/30">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-neon-violet" />
            <h3 className="text-lg font-semibold text-off-white">
              Your Compound Position
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-soft-gray mb-1">Supplied</div>
              <div className="text-lg font-bold text-aqua-blue">
                {userPosition.isSupplying
                  ? `${parseFloat(userPosition.baseAssetBalance).toFixed(2)} ${
                      COMPOUND_CONFIG.BASE_ASSET.symbol
                    }`
                  : "0.00"}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Borrowed</div>
              <div className="text-lg font-bold text-neon-violet">
                {userPosition.isBorrowing
                  ? `${parseFloat(userPosition.borrowBalance).toFixed(2)} ${
                      COMPOUND_CONFIG.BASE_ASSET.symbol
                    }`
                  : "0.00"}
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Collateral</div>
              <div className="text-lg font-bold text-electric-yellow">
                {userPosition.collateralBalances
                  .filter((c) => parseFloat(c.balance) > 0)
                  .length || 0}{" "}
                assets
              </div>
            </div>
            <div>
              <div className="text-xs text-soft-gray mb-1">Health Status</div>
              <div
                className={`text-lg font-bold ${
                  userPosition.isCollateralized
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {userPosition.isCollateralized ? "Healthy" : "At Risk"}
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

      {/* Asset Cards */}
      {marketData && (
        <div>
          <h3 className="text-xl font-bold text-off-white mb-4">
            Supply Assets
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Base Asset Card */}
            <CompoundTokenCard
              token={marketData.baseAsset.symbol}
              tokenName={marketData.baseAsset.name}
              tokenLogo={marketData.baseAsset.logo}
              tokenAddress={marketData.baseAsset.address}
              chainId={chainId}
              chainIcon={chainInfo.icon}
              chainName={chainInfo.name}
              isBaseAsset={true}
              supplyAPY={marketData.supplyAPY}
              borrowAPY={marketData.borrowAPY}
              userBalance={userPosition.walletBalances[marketData.baseAsset.symbol] || "0"}
              userSuppliedBalance={
                userPosition.isSupplying
                  ? userPosition.baseAssetBalance
                  : "0"
              }
              decimals={marketData.baseAsset.decimals}
            />

            {/* Collateral Asset Cards */}
            {marketData.collateralAssets.map((asset) => {
              const collateralBalance = userPosition.collateralBalances.find(
                (c) => c.symbol === asset.symbol
              );
              return (
                <CompoundTokenCard
                  key={asset.symbol}
                  token={asset.symbol}
                  tokenName={asset.name}
                  tokenLogo={asset.logo}
                  tokenAddress={asset.address}
                  chainId={chainId}
                  chainIcon={chainInfo.icon}
                  chainName={chainInfo.name}
                  isBaseAsset={false}
                  userBalance={userPosition.walletBalances[asset.symbol] || "0"}
                  userSuppliedBalance={collateralBalance?.balance || "0"}
                  decimals={asset.decimals}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Protocol Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card border border-aqua-blue/20">
          <div className="text-sm text-soft-gray mb-1">Protocol</div>
          <div className="text-2xl font-bold text-aqua-blue">Compound V3</div>
          <div className="text-xs text-soft-gray mt-1">
            Comet on {chainInfo.name}
          </div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-neon-violet/20">
          <div className="text-sm text-soft-gray mb-1">Market</div>
          <div className="text-2xl font-bold text-neon-violet">
            {COMPOUND_CONFIG.BASE_ASSET.symbol}
          </div>
          <div className="text-xs text-soft-gray mt-1">Base asset</div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-electric-yellow/20">
          <div className="text-sm text-soft-gray mb-1">Network</div>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={chainInfo.icon}
              alt={chainInfo.name}
              className="w-6 h-6 object-contain"
            />
            <span className="text-xl font-bold text-electric-yellow">
              {chainInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingMarketData && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua-blue"></div>
        </div>
      )}
    </div>
  );
}
