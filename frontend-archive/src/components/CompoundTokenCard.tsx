import { useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { ArrowUpRight, ArrowDownLeft, Loader2, CircleDollarSign } from "lucide-react";
import { getCompoundConfigByChainId, COMET_ABI, ERC20_ABI } from "../config/compound";

interface CompoundTokenCardProps {
  token: string;
  tokenName?: string;
  tokenLogo?: string;
  tokenAddress: string;
  chainId: number;
  chainIcon: string;
  chainName: string;
  isBaseAsset: boolean;
  supplyAPY?: string;
  borrowAPY?: string;
  userBalance?: string; // Wallet balance
  userSuppliedBalance?: string; // Balance in protocol
  decimals: number;
}

export function CompoundTokenCard({
  token,
  tokenName,
  tokenLogo,
  tokenAddress,
  chainId,
  chainIcon,
  chainName,
  isBaseAsset,
  supplyAPY,
  borrowAPY,
  userBalance,
  userSuppliedBalance,
  decimals = 18,
}: CompoundTokenCardProps) {
  const [amount, setAmount] = useState("100");
  const [mode, setMode] = useState<"supply" | "withdraw">("supply");

  const { address } = useAccount();
  const COMPOUND_CONFIG = getCompoundConfigByChainId(chainId);

  // Approve and supply hooks
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const {
    writeContract: writeSupply,
    data: supplyHash,
    isPending: isSupplyPending,
  } = useWriteContract();

  const { isLoading: isSupplyConfirming } = useWaitForTransactionReceipt({
    hash: supplyHash,
  });

  // Withdraw hook
  const {
    writeContract: writeWithdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Get allowance
  const { data: allowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, COMPOUND_CONFIG.COMET as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  });

  // Check if approval is needed
  const needsApproval =
    mode === "supply" &&
    allowance !== undefined &&
    amount &&
    parseFloat(amount) > 0 &&
    BigInt(allowance.toString()) < parseUnits(amount, decimals);

  // Format balance for display
  const formatBalance = (balance?: string): string => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    if (num === 0) return "0.00";
    if (num < 0.01) return "<0.01";
    return num.toFixed(2);
  };

  // Handle approve
  const handleApprove = async () => {
    if (!amount || !address) return;

    try {
      const amountWei = parseUnits(amount, decimals);
      writeApprove({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [COMPOUND_CONFIG.COMET as `0x${string}`, amountWei],
      });
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  // Handle supply
  const handleSupply = async () => {
    if (!amount || !address) return;

    try {
      const amountWei = parseUnits(amount, decimals);
      writeSupply({
        address: COMPOUND_CONFIG.COMET as `0x${string}`,
        abi: COMET_ABI,
        functionName: "supply",
        args: [tokenAddress as `0x${string}`, amountWei],
      });
    } catch (error) {
      console.error("Supply error:", error);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!amount || !address) return;

    try {
      const amountWei = parseUnits(amount, decimals);
      writeWithdraw({
        address: COMPOUND_CONFIG.COMET as `0x${string}`,
        abi: COMET_ABI,
        functionName: "withdraw",
        args: [tokenAddress as `0x${string}`, amountWei],
      });
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  return (
    <div className="p-6 rounded-xl glass-card border border-aqua-blue/20 hover:border-aqua-blue/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-violet/20 to-aqua-blue/20 flex items-center justify-center border border-aqua-blue/20">
            {tokenLogo ? (
              <img
                src={tokenLogo}
                alt={token}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <CircleDollarSign className="h-6 w-6 text-aqua-blue" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-off-white">{token}</h3>
            <p className="text-xs text-soft-gray">
              {tokenName || token}
              {isBaseAsset && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-aqua-blue/20 text-aqua-blue">
                  BASE
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Chain Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-deep-purple/30 border border-aqua-blue/20">
          <img src={chainIcon} alt={chainName} className="w-4 h-4 object-contain" />
          <span className="text-xs font-medium text-soft-gray">{chainName}</span>
        </div>
      </div>

      {/* APY Display */}
      {(supplyAPY || borrowAPY) && (
        <div className="mb-4 p-3 rounded-lg bg-deep-purple/20 border border-aqua-blue/10">
          <div className="grid grid-cols-2 gap-4">
            {isBaseAsset && supplyAPY && (
              <div>
                <div className="text-xs text-soft-gray mb-1">Supply APY</div>
                <div className="text-lg font-bold text-aqua-blue">{supplyAPY}%</div>
              </div>
            )}
            {isBaseAsset && borrowAPY && (
              <div>
                <div className="text-xs text-soft-gray mb-1">Borrow APY</div>
                <div className="text-lg font-bold text-neon-violet">{borrowAPY}%</div>
              </div>
            )}
            {!isBaseAsset && (
              <div className="col-span-2">
                <div className="text-xs text-soft-gray mb-1">Type</div>
                <div className="text-sm font-medium text-electric-yellow">
                  Collateral Asset
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Balance Display */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-deep-purple/10 border border-soft-gray/10">
          <div className="text-xs text-soft-gray mb-1">Wallet</div>
          <div className="text-sm font-bold text-off-white">
            {formatBalance(userBalance)} {token}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-deep-purple/10 border border-aqua-blue/10">
          <div className="text-xs text-soft-gray mb-1">Supplied</div>
          <div className="text-sm font-bold text-aqua-blue">
            {formatBalance(userSuppliedBalance)} {token}
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-4 p-1 rounded-lg bg-dark-charcoal/50 flex gap-1">
        <button
          onClick={() => setMode("supply")}
          className={`flex-1 py-2 px-4 rounded-md transition-all font-medium text-sm ${
            mode === "supply"
              ? "bg-aqua-blue/20 text-aqua-blue"
              : "text-soft-gray hover:text-off-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Supply
          </div>
        </button>
        <button
          onClick={() => setMode("withdraw")}
          className={`flex-1 py-2 px-4 rounded-md transition-all font-medium text-sm ${
            mode === "withdraw"
              ? "bg-neon-violet/20 text-neon-violet"
              : "text-soft-gray hover:text-off-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Withdraw
          </div>
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-xs text-soft-gray mb-2 block">Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-dark-charcoal/50 border border-soft-gray/20 rounded-xl text-off-white placeholder-soft-gray/50 focus:outline-none focus:border-aqua-blue/50 transition-colors"
          />
          <button
            onClick={() => {
              if (mode === "supply" && userBalance) {
                setAmount(userBalance);
              } else if (mode === "withdraw" && userSuppliedBalance) {
                setAmount(userSuppliedBalance);
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-aqua-blue/10 hover:bg-aqua-blue/20 text-aqua-blue text-xs font-medium transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {mode === "supply" ? (
          <>
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApprovePending || isApproveConfirming || amount === "" || parseFloat(amount || "0") === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-aqua-blue to-aqua-blue/80 hover:from-aqua-blue/90 hover:to-aqua-blue/70 text-off-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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
                disabled={Boolean(
                  isSupplyPending || 
                  isSupplyConfirming || 
                  amount === "" ||
                  parseFloat(amount || "0") === 0 || 
                  needsApproval
                )}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-aqua-blue to-aqua-blue/80 hover:from-aqua-blue/90 hover:to-aqua-blue/70 text-off-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isSupplyPending || isSupplyConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSupplyPending ? "Supplying..." : "Confirming..."}
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Supply {token}
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={
              isWithdrawPending || 
              isWithdrawConfirming || 
              amount === "" ||
              parseFloat(amount || "0") === 0
            }
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-violet to-neon-violet/80 hover:from-neon-violet/90 hover:to-neon-violet/70 text-off-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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

      {/* Transaction Status */}
      {(supplyHash || withdrawHash || approveHash) && (
        <div className="mt-3 p-2 rounded-lg bg-aqua-blue/10 border border-aqua-blue/20">
          <p className="text-xs text-aqua-blue text-center">
            Transaction submitted! Check your wallet for confirmation.
          </p>
        </div>
      )}
    </div>
  );
}
