import { useState } from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { ArrowUpRight, ArrowDownLeft, Loader2, CircleDollarSign } from "lucide-react";
import {
  getAaveConfig,
  AAVE_POOL_ABI,
  ERC20_ABI,
} from "../config/aave";
import type { SUPPORTED_TOKENS } from "@avail-project/nexus-widgets";

interface AaveTokenCardProps {
  token: string;
  tokenName?: string;
  tokenLogo?: string;
  networkMode: "testnet" | "mainnet";
  chainIcon: string;
  chainName: string;
  chainColor: string;
  apy: string;
  availableLiquidity: string;
  userBalance?: string;
  userATokenBalance?: string;
  aTokenAddress?: string;
  underlyingAsset?: string;
  decimals?: number;
  loading?: boolean;
  showBridgeSupply?: boolean;
}

export function AaveTokenCard({
  token,
  tokenName,
  tokenLogo,
  networkMode,
  chainIcon,
  chainName,
  chainColor,
  apy,
  availableLiquidity,
  userBalance,
  userATokenBalance,
  underlyingAsset,
  decimals = 18,
  loading,
  showBridgeSupply = false,
}: AaveTokenCardProps) {
  const [amount, setAmount] = useState("100");
  const [mode, setMode] = useState<"supply" | "withdraw">("supply");
  
  const { address } = useAccount();
  const AAVE_CONFIG = getAaveConfig(networkMode);
  const tokenAddress = underlyingAsset;
  
  // Approve and supply hooks
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();
  
  const { isLoading: isApproveConfirming } =
    useWaitForTransactionReceipt({ hash: approveHash });
  
  const {
    writeContract: writeSupply,
    data: supplyHash,
    isPending: isSupplyPending,
  } = useWriteContract();
  
  const { isLoading: isSupplyConfirming } =
    useWaitForTransactionReceipt({ hash: supplyHash });
  
  // Withdraw hook
  const {
    writeContract: writeWithdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();
  
  const { isLoading: isWithdrawConfirming } =
    useWaitForTransactionReceipt({ hash: withdrawHash });
  
  // Get allowance
  const { data: allowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, AAVE_CONFIG.POOL as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  });
  
  // Format balance helper - now receives strings from API
  const formatBalance = (balance?: string) => {
    if (!balance || balance === "0") return "0.00";
    return parseFloat(balance).toFixed(2);
  };
  
  // Handle approve
  const handleApprove = () => {
    if (!tokenAddress || !amount) return;
    
    const amountWei = parseUnits(amount, decimals);
    writeApprove({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [AAVE_CONFIG.POOL as `0x${string}`, amountWei],
    });
  };
  
  // Handle supply
  const handleSupply = () => {
    if (!tokenAddress || !amount || !address) return;
    
    const amountWei = parseUnits(amount, decimals);
    writeSupply({
      address: AAVE_CONFIG.POOL as `0x${string}`,
      abi: AAVE_POOL_ABI,
      functionName: "supply",
      args: [tokenAddress as `0x${string}`, amountWei, address, 0],
      gas: 350000n,
    });
  };
  
  // Handle withdraw
  const handleWithdraw = () => {
    if (!tokenAddress || !amount || !address) return;
    
    const amountWei = parseUnits(amount, decimals);
    writeWithdraw({
      address: AAVE_CONFIG.POOL as `0x${string}`,
      abi: AAVE_POOL_ABI,
      functionName: "withdraw",
      args: [tokenAddress as `0x${string}`, amountWei, address],
      gas: 350000n,
    });
  };
  
  const needsApproval = mode === "supply" && allowance !== undefined && 
    parseUnits(amount || "0", decimals) > (allowance as bigint);
  
  const expectedYield = (parseFloat(amount || "0") * parseFloat(apy)) / 100;
  const monthlyYield = expectedYield / 12;
  
  return (
    <div className="p-6 rounded-2xl glass-card border-2 border-aqua-blue/20 hover:border-aqua-blue/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/30 to-aqua-blue/30 flex items-center justify-center overflow-hidden">
            {tokenLogo ? (
              <img src={tokenLogo} alt={token} className="w-8 h-8 object-contain" />
            ) : (
              <CircleDollarSign className="h-6 w-6 text-aqua-blue" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-off-white">{token}</h3>
            <p className="text-xs text-soft-gray">
              {tokenName || token}
            </p>
          </div>
        </div>
        
        {/* Chain Badge */}
        <div 
          className="px-3 py-1.5 rounded-lg border-2 flex items-center gap-2"
          style={{ borderColor: chainColor + "40", backgroundColor: chainColor + "10" }}
        >
          <img src={chainIcon} alt={chainName} className="w-4 h-4 object-contain" />
          <span className="text-xs font-semibold text-off-white">{chainName}</span>
        </div>
      </div>
      
      {/* APY Display */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-neon-violet/20 to-transparent border border-neon-violet/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-soft-gray">Supply APY</span>
          <div className="text-right">
            <div className="text-3xl font-bold text-neon-violet">
              {loading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : `${apy}%`}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Balances */}
      {address && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg glass-card border border-soft-gray/20">
            <div className="text-xs text-soft-gray mb-1">Suppliable</div>
            <div className="text-sm font-bold text-off-white">
              {formatBalance(userBalance)} {token}
            </div>
          </div>
          <div className="p-3 rounded-lg glass-card border border-aqua-blue/30">
            <div className="text-xs text-soft-gray mb-1">Supplied</div>
            <div className="text-sm font-bold text-aqua-blue">
              {formatBalance(userATokenBalance)} {token}
            </div>
          </div>
        </div>
      )}
      
      {/* Market Info */}
      <div className="mb-4 p-3 rounded-lg glass-card border border-soft-gray/20">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-soft-gray">Available Liquidity</span>
            <div className="font-semibold text-off-white mt-1">{availableLiquidity} {token}</div>
          </div>
          <div>
            <span className="text-soft-gray">Expected APY</span>
            <div className="font-semibold text-neon-violet mt-1">+{expectedYield.toFixed(2)} {token}/yr</div>
          </div>
        </div>
      </div>
      
      {/* Mode Toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("supply")}
          className={`p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === "supply"
              ? "bg-neon-violet/20 border-2 border-neon-violet text-off-white"
              : "glass-card border border-soft-gray/20 text-soft-gray"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span className="font-semibold text-sm">Supply</span>
        </button>
        <button
          onClick={() => setMode("withdraw")}
          className={`p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
            mode === "withdraw"
              ? "bg-aqua-blue/20 border-2 border-aqua-blue text-off-white"
              : "glass-card border border-soft-gray/20 text-soft-gray"
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" />
          <span className="font-semibold text-sm">Withdraw</span>
        </button>
      </div>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-soft-gray mb-2">Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-deep-space/50 border border-soft-gray/20 rounded-xl text-off-white focus:outline-none focus:border-neon-violet/50 transition-colors"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-gray font-medium text-sm">
            {token}
          </div>
        </div>
        
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2">
          {mode === "supply" && ["50", "100", "500"].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className="px-2 py-1 rounded-lg glass-card text-xs text-soft-gray hover:text-off-white transition-colors"
            >
              {preset}
            </button>
          ))}
          {mode === "withdraw" && userATokenBalance && (
            <button
              onClick={() => setAmount(formatBalance(userATokenBalance))}
              className="px-2 py-1 rounded-lg glass-card text-xs text-soft-gray hover:text-off-white transition-colors"
            >
              Max
            </button>
          )}
        </div>
      </div>
      
      {/* Expected Yield (only for supply) */}
      {mode === "supply" && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-neon-violet/10 to-transparent border border-neon-violet/30">
          <div className="flex justify-between text-xs">
            <span className="text-soft-gray">Monthly (Est.)</span>
            <span className="font-semibold text-neon-violet">+{monthlyYield.toFixed(2)} {token}</span>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-2">
        {mode === "supply" ? (
          <>
            {/* Cross-chain option - Only show for USDC */}
            {showBridgeSupply && token === "USDC" && (
              <BridgeAndExecuteButton
                contractAddress={AAVE_CONFIG.POOL}
                contractAbi={AAVE_POOL_ABI}
                functionName="supply"
                buildFunctionParams={(_, amt, _chainId, userAddress) => {
                  const amountWei = parseUnits(amt, decimals);
                  return {
                    functionParams: [
                      tokenAddress as `0x${string}`,
                      amountWei,
                      userAddress,
                      0,
                    ],
                  };
                }}
                prefill={{
                  toChainId: AAVE_CONFIG.CHAIN_ID,
                  token: token as SUPPORTED_TOKENS,
                  amount: amount,
                }}
              >
                {({ onClick, isLoading, disabled }) => (
                  <button
                    onClick={onClick}
                    disabled={isLoading || disabled || !amount}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isLoading || disabled || !amount
                        ? "bg-soft-gray/20 text-soft-gray cursor-not-allowed"
                        : "bg-gradient-to-r from-neon-violet to-neon-violet/80 hover:from-neon-violet/90 hover:to-neon-violet/70 text-off-white"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Bridge & Supply {token}</>
                    )}
                  </button>
                )}
              </BridgeAndExecuteButton>
            )}
            
            {/* Direct supply (if on same chain) */}
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApprovePending || isApproveConfirming || !amount}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-violet to-neon-violet/80 hover:from-neon-violet/90 hover:to-neon-violet/70 text-off-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isApprovePending || isApproveConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isApprovePending ? "Approving..." : "Confirming..."}
                  </>
                ) : (
                  <>Approve {token}</>
                )}
              </button>
            ) : (
              <button
                onClick={handleSupply}
                disabled={isSupplyPending || isSupplyConfirming || !amount}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-aqua-blue to-aqua-blue/80 hover:from-aqua-blue/90 hover:to-aqua-blue/70 text-deep-space font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isSupplyPending || isSupplyConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSupplyPending ? "Supplying..." : "Confirming..."}
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Supply {token} Directly
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawPending || isWithdrawConfirming || !amount}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-aqua-blue to-aqua-blue/80 hover:from-aqua-blue/90 hover:to-aqua-blue/70 text-deep-space font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isWithdrawPending || isWithdrawConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isWithdrawPending ? "Withdrawing..." : "Confirming..."}
              </>
            ) : (
              <>
                <ArrowDownLeft className="h-4 w-4" />
                Withdraw {token}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
