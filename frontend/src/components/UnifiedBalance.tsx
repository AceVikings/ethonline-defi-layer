import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useNexus } from "@avail-project/nexus-widgets";
import { Wallet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface TokenBalance {
  symbol: string;
  name: string;
  total: string;
  decimals: number;
  chains: {
    chainId: number;
    chainName: string;
    balance: string;
    logo: string;
  }[];
}

const SUPPORTED_TOKENS = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "USDT", name: "Tether USD" },
  { symbol: "POL", name: "Polygon" },
  { symbol: "MON", name: "Monad" },
];

const CHAIN_INFO: Record<number, { name: string; logo: string }> = {
  11155111: {
    name: "Sepolia",
    logo: "https://assets.coingecko.com/asset_platforms/images/279/large/ethereum.png",
  },
  84532: {
    name: "Base Sepolia",
    logo: "https://pbs.twimg.com/profile_images/1945608199500910592/rnk6ixxH_400x400.jpg",
  },
  421614: {
    name: "Arbitrum Sepolia",
    logo: "https://assets.coingecko.com/coins/images/16547/large/arb.jpg",
  },
  11155420: {
    name: "Optimism Sepolia",
    logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  },
  80002: {
    name: "Polygon Amoy",
    logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  },
  10143: {
    name: "Monad Testnet",
    logo: "https://assets.coingecko.com/coins/images/38927/standard/monad.jpg",
  },
};

export function UnifiedBalance() {
  const { address, isConnected } = useAccount();
  const { sdk, isSdkInitialized } = useNexus();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);
  const isLoadingRef = useRef(false);

  const toggleToken = (symbol: string) => {
    setExpandedTokens((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const fetchBalances = useCallback(async () => {
    console.log("Starting fetchBalances...");
    console.log("SDK state:", { sdk: !!sdk, address: !!address, isConnected, isSdkInitialized });
    
    if (!sdk || !address || !isConnected) {
      console.log("Missing basic requirements");
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isLoadingRef.current) {
      console.log("Already loading, skipping...");
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching unified balances for address:", address);

      // Try to get unified balances - if SDK isn't initialized, this will throw an error
      const unifiedBalances = await sdk.getUnifiedBalances();
      console.log("Unified balances from Nexus SDK:", unifiedBalances);

      const tokenBalances: TokenBalance[] = [];

      for (const token of SUPPORTED_TOKENS) {
        // Find this token in the unified balances
        const tokenBalance = unifiedBalances.find(
          (asset: any) =>
            asset.symbol?.toUpperCase() === token.symbol.toUpperCase()
        );

        if (
          tokenBalance &&
          tokenBalance.breakdown &&
          tokenBalance.breakdown.length > 0
        ) {
          // Extract chain-specific balances
          const chainBalances = tokenBalance.breakdown
            .map((chainData: any) => ({
              chainId: chainData.chain.id,
              chainName:
                CHAIN_INFO[chainData.chain.id]?.name ||
                chainData.chain.name ||
                `Chain ${chainData.chain.id}`,
              balance: chainData.balance || "0",
              logo:
                CHAIN_INFO[chainData.chain.id]?.logo ||
                chainData.chain.logo ||
                "",
            }))
            .filter((c: any) => parseFloat(c.balance) > 0);

          tokenBalances.push({
            symbol: token.symbol,
            name: token.name,
            total: tokenBalance.balance || "0",
            decimals:
              tokenBalance.decimals ||
              (token.symbol === "USDC" || token.symbol === "USDT" ? 6 : 18),
            chains: chainBalances,
          });
        } else {
          // Token not found or has zero balance
          tokenBalances.push({
            symbol: token.symbol,
            name: token.name,
            total: "0",
            decimals:
              token.symbol === "USDC" || token.symbol === "USDT" ? 6 : 18,
            chains: [],
          });
        }
      }

      setBalances(tokenBalances);
      hasFetched.current = true;
      console.log("Balances fetched successfully:", tokenBalances);
    } catch (err) {
      console.error("Error fetching unified balances:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch balances";
      
      // If it's an initialization error, retry after a short delay
      if (errorMessage.includes("not initialized") || errorMessage.includes("CA not initialized")) {
        console.log("SDK not ready yet, will retry when state updates...");
        hasFetched.current = false; // Allow retry
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [sdk, address, isConnected]);

  // Fetch balances when SDK is available - retry on SDK state updates
  useEffect(() => {
    console.log("useEffect triggered:", { isConnected, address: !!address, sdk: !!sdk, isSdkInitialized, hasFetched: hasFetched.current, isLoading: isLoadingRef.current });
    
    if (!isConnected || !address || !sdk) {
      hasFetched.current = false;
      return;
    }

    // Try to fetch balances if we haven't successfully fetched yet
    // The fetchBalances function will handle SDK initialization errors gracefully
    if (!hasFetched.current && !isLoadingRef.current) {
      console.log("Attempting to fetch balances...");
      fetchBalances();
    }
  }, [sdk, isConnected, address, isSdkInitialized, fetchBalances]);

  const formatBalance = (balance: string, decimals: number): string => {
    const value = parseFloat(balance);
    if (value === 0) return "0.00";
    if (value < 0.01) return "< 0.01";
    return value.toFixed(decimals === 6 ? 2 : 4);
  };

  if (!isConnected) {
    return (
      <div className="p-8 rounded-2xl glass-card border-2 border-neon-violet/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-neon-violet" />
          </div>
          <div>
            <h3
              className="text-xl font-bold text-off-white"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Unified Balance
            </h3>
            <p className="text-sm text-soft-gray">
              Connect your wallet to view balances
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border-2 border-neon-violet/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-neon-violet" />
            </div>
            <div>
              <h3
                className="text-xl font-bold text-off-white"
                style={{ fontFamily: "Inter Tight, sans-serif" }}
              >
                Unified Balance
              </h3>
              <p className="text-sm text-soft-gray">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              hasFetched.current = false;
              fetchBalances();
            }}
            disabled={loading}
            className="p-3 rounded-xl glass-card glass-card-hover transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-5 w-5 text-neon-violet ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 rounded-2xl glass-card border-2 border-aqua-blue/20 text-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 text-aqua-blue animate-spin" />
            <p className="text-soft-gray">
              Fetching balances across all chains...
            </p>
          </div>
        </div>
      )}

      {/* Balances */}
      {!loading && balances.length > 0 && (
        <div className="space-y-4">
          {balances.map((token) => {
            const isExpanded = expandedTokens.has(token.symbol);
            const hasBalance = parseFloat(token.total) > 0;

            return (
              <div
                key={token.symbol}
                className="rounded-2xl glass-card border-2 border-aqua-blue/20 overflow-hidden"
              >
                {/* Token Summary */}
                <button
                  onClick={() => hasBalance && toggleToken(token.symbol)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                  disabled={!hasBalance}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aqua-blue/30 to-aqua-blue/10 flex items-center justify-center border-2 border-aqua-blue/30">
                      <span className="text-sm font-bold text-aqua-blue">
                        {token.symbol}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-off-white">
                          {token.symbol}
                        </h4>
                        <span className="text-xs text-soft-gray">
                          {token.name}
                        </span>
                      </div>
                      {hasBalance && token.chains.length > 0 && (
                        <p className="text-xs text-soft-gray">
                          {token.chains.length} chain
                          {token.chains.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-off-white">
                        {formatBalance(token.total, token.decimals)}
                      </p>
                      <p className="text-xs text-soft-gray">{token.symbol}</p>
                    </div>
                    {hasBalance && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aqua-blue/20 to-transparent flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-aqua-blue" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-aqua-blue" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Chain Breakdown */}
                {isExpanded && hasBalance && (
                  <div className="border-t border-white/10 bg-black/20">
                    <div className="p-6 space-y-3">
                      {token.chains.map((chain) => (
                        <div
                          key={chain.chainId}
                          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-white/5 to-transparent"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={chain.logo}
                              alt={chain.chainName}
                              className="w-6 h-6 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium text-off-white">
                                {chain.chainName}
                              </p>
                              <p className="text-xs text-soft-gray">
                                Chain {chain.chainId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-off-white">
                              {formatBalance(chain.balance, token.decimals)}
                            </p>
                            <p className="text-xs text-soft-gray">
                              {token.symbol}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && balances.length === 0 && !error && (
        <div className="p-8 rounded-2xl glass-card border-2 border-soft-gray/20 text-center">
          <p className="text-soft-gray">No balances found</p>
        </div>
      )}
    </div>
  );
}
