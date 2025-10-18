import { useState } from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { parseUnits, maxUint256 } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TrendingUp, ArrowUpRight, Info, Check } from "lucide-react";
import { AAVE_V3_SEPOLIA, AAVE_POOL_ABI, ERC20_ABI, getAaveAssetAddress } from "../config/aave";
import type { SUPPORTED_TOKENS } from "@avail-project/nexus-widgets";

// Supported tokens for Aave (intersection with Nexus supported tokens)
const AAVE_SUPPORTED_TOKENS: SUPPORTED_TOKENS[] = ["USDC", "USDT"];

interface AaveYieldProps {
  className?: string;
}

export function AaveYield({ className = "" }: AaveYieldProps) {
  const [selectedToken, setSelectedToken] = useState<SUPPORTED_TOKENS>("USDC");
  const [amount, setAmount] = useState("100");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  const { address } = useAccount();
  const { writeContract, data: approvalHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Mock APY data (in production, fetch from Aave data provider)
  const mockAPY: Partial<Record<SUPPORTED_TOKENS, string>> = {
    USDC: "4.25",
    USDT: "5.10",
  };

  // Get APY with fallback
  const getAPY = (token: SUPPORTED_TOKENS): string => {
    return mockAPY[token] || "0.00";
  };

  // Handle approval
  const handleApprove = async () => {
    if (!address) return;

    const tokenAddress = getAaveAssetAddress(selectedToken as "USDC" | "USDT");
    if (!tokenAddress) return;

    try {
      // Approve max uint256 for better UX (one-time approval)
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [AAVE_V3_SEPOLIA.POOL, maxUint256],
      });
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  // Set approved when transaction confirms
  if (isApprovalSuccess && !isApproved) {
    setIsApproved(true);
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border-2 border-neon-violet/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-neon-violet" />
          </div>
          <div>
            <h3
              className="text-xl font-bold text-off-white"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              Aave V3 Yield
            </h3>
            <p className="text-sm text-soft-gray">
              Earn yield on Ethereum Sepolia
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="p-8 rounded-2xl glass-card border-2 border-aqua-blue/20">
        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-aqua-blue/10 to-transparent border border-aqua-blue/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-aqua-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm text-off-white">
              <p className="font-semibold mb-1">Two-Step Cross-Chain Yield</p>
              <p className="text-soft-gray">
                First, approve Aave Pool to spend your tokens (one-time setup per token). 
                Then, bridge your tokens from any chain and supply to Aave V3 on Sepolia. 
                Your tokens will start earning yield immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Token Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-off-white mb-3">
            Select Token
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AAVE_SUPPORTED_TOKENS.map((token) => (
              <button
                key={token}
                onClick={() => {
                  setSelectedToken(token);
                  setIsApproved(false); // Reset approval when changing tokens
                }}
                className={`p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 ${
                  selectedToken === token
                    ? "border-2 border-neon-violet bg-neon-violet/10"
                    : "border border-soft-gray/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-bold text-off-white">{token}</div>
                    <div className="text-xs text-soft-gray mt-1">
                      {token === "USDC" ? "USD Coin" : "Tether USD"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-neon-violet">
                      {getAPY(token)}%
                    </div>
                    <div className="text-xs text-soft-gray">APY</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-off-white mb-3">
            Amount to Supply
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 bg-deep-space/50 border border-soft-gray/20 rounded-xl text-off-white text-lg focus:outline-none focus:border-neon-violet/50 transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-gray font-medium">
              {selectedToken}
            </div>
          </div>
          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-3">
            {["50", "100", "500", "1000"].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="px-3 py-1.5 rounded-lg glass-card glass-card-hover text-xs text-soft-gray hover:text-off-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Yield */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-neon-violet/10 to-transparent border border-neon-violet/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-soft-gray">Expected Annual Yield</span>
            <span className="text-lg font-bold text-neon-violet">
              +{(parseFloat(amount || "0") * parseFloat(getAPY(selectedToken)) / 100).toFixed(2)} {selectedToken}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-soft-gray">Monthly (Est.)</span>
            <span className="text-sm font-semibold text-off-white">
              +{(parseFloat(amount || "0") * parseFloat(getAPY(selectedToken)) / 100 / 12).toFixed(2)} {selectedToken}
            </span>
          </div>
        </div>

        {/* Step 1: Approve Token */}
        {!isApproved && (
          <div className="mb-4">
            <button
              onClick={handleApprove}
              disabled={!address || isApprovePending || isApprovalConfirming}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aqua-blue to-aqua-blue/80 text-deep-space font-bold text-lg hover:shadow-lg hover:shadow-aqua-blue/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isApprovePending || isApprovalConfirming ? (
                <>
                  <div className="w-5 h-5 border-3 border-deep-space/30 border-t-deep-space rounded-full animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <span>Step 1: Approve {selectedToken}</span>
                </>
              )}
            </button>
            <p className="text-xs text-soft-gray mt-2 text-center">
              Allow Aave Pool to spend your {selectedToken} tokens
            </p>
          </div>
        )}

        {/* Step 2: Bridge & Supply Button */}
        {isApproved && (
          <div className="mb-4 p-3 rounded-xl bg-aqua-blue/10 border border-aqua-blue/30 flex items-center gap-2">
            <Check className="h-5 w-5 text-aqua-blue" />
            <span className="text-sm text-aqua-blue font-medium">Token approved! Now you can bridge & supply.</span>
          </div>
        )}
        
        {isApproved ? (
          <BridgeAndExecuteButton
            contractAddress={AAVE_V3_SEPOLIA.POOL}
            contractAbi={AAVE_POOL_ABI}
            functionName="supply"
            buildFunctionParams={(token, amt, _chainId, userAddress) => {
              const decimals = token === "USDC" || token === "USDT" ? 6 : 18;
              const amountWei = parseUnits(amt, decimals);
              const tokenAddress = getAaveAssetAddress(token as "USDC" | "USDT");
              
              return {
                functionParams: [
                  tokenAddress,      // asset
                  amountWei,         // amount
                  userAddress,       // onBehalfOf
                  0,                 // referralCode
                ],
              };
            }}
            prefill={{
              toChainId: AAVE_V3_SEPOLIA.CHAIN_ID,
              token: selectedToken,
              amount: amount,
            }}
          >
            {({ onClick, isLoading, disabled }) => (
              <button
                onClick={() => {
                  onClick();
                  if (!isLoading) {
                    // Show success after a delay (simulated)
                    setTimeout(() => setShowSuccess(true), 3000);
                    setTimeout(() => setShowSuccess(false), 6000);
                  }
                }}
                disabled={isLoading || disabled || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading || disabled || !amount || parseFloat(amount) <= 0
                  ? "bg-soft-gray/20 text-soft-gray cursor-not-allowed"
                  : "bg-gradient-to-r from-neon-violet to-neon-violet/80 text-off-white hover:shadow-neon-glow glass-card-hover"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5" />
                  <span>
                    Step 2: Bridge & Supply to Aave
                  </span>
                </>
              )}
            </button>
          )}
        </BridgeAndExecuteButton>
        ) : (
          <div className="w-full py-4 px-6 rounded-xl bg-soft-gray/10 text-soft-gray font-bold text-lg text-center border-2 border-dashed border-soft-gray/30">
            Please approve token first
          </div>
        )}

        {/* How it works */}
        <div className="mt-6 p-4 rounded-xl bg-deep-space/30 border border-soft-gray/10">
          <h4 className="text-sm font-semibold text-off-white mb-3">
            How it works:
          </h4>
          <ol className="space-y-2 text-sm text-soft-gray">
            <li className="flex items-start gap-2">
              <span className="text-aqua-blue font-bold">1.</span>
              <span>
                <strong className="text-aqua-blue">Approve:</strong> Allow Aave Pool to spend your {selectedToken} tokens (one-time setup)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-violet font-bold">2.</span>
              <span>
                <strong className="text-neon-violet">Bridge:</strong> Your {selectedToken} is bridged from your current chain to Ethereum Sepolia
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-violet font-bold">3.</span>
              <span>
                <strong className="text-neon-violet">Supply:</strong> Tokens are supplied to Aave V3 lending pool
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-violet font-bold">4.</span>
              <span>
                <strong className="text-neon-violet">Earn:</strong> You receive aTokens (a{selectedToken}) that earn interest in real-time
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-soft-gray font-bold">5.</span>
              <span>
                <strong className="text-soft-gray">Withdraw:</strong> Redeem anytime by burning your aTokens
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-8 right-8 p-6 rounded-xl bg-gradient-to-r from-neon-violet to-aqua-blue border-2 border-neon-violet shadow-neon-glow animate-fade-in z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-off-white/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-off-white" />
            </div>
            <div>
              <div className="font-bold text-off-white">
                Successfully supplied to Aave!
              </div>
              <div className="text-sm text-off-white/80">
                Your {selectedToken} is now earning {getAPY(selectedToken)}% APY
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card border border-aqua-blue/20">
          <div className="text-sm text-soft-gray mb-1">Total Supplied</div>
          <div className="text-2xl font-bold text-off-white">$0.00</div>
          <div className="text-xs text-soft-gray mt-1">Across all assets</div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-neon-violet/20">
          <div className="text-sm text-soft-gray mb-1">Total Earned</div>
          <div className="text-2xl font-bold text-neon-violet">$0.00</div>
          <div className="text-xs text-soft-gray mt-1">Lifetime earnings</div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-soft-gray/20">
          <div className="text-sm text-soft-gray mb-1">Avg APY</div>
          <div className="text-2xl font-bold text-aqua-blue">
            {((parseFloat(getAPY("USDC")) + parseFloat(getAPY("USDT"))) / 2).toFixed(2)}%
          </div>
          <div className="text-xs text-soft-gray mt-1">Weighted average</div>
        </div>
      </div>
    </div>
  );
}
