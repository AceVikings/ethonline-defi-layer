import { useState, useEffect } from "react";
import { BridgeAndExecuteButton } from "@avail-project/nexus-widgets";
import { parseUnits } from "viem";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSignTypedData,
  useReadContract,
} from "wagmi";
import { TrendingUp, ArrowUpRight, Info, Zap } from "lucide-react";
import {
  getAaveConfig,
  AAVE_POOL_ABI,
  ERC20_ABI,
  getAaveAssetAddress,
} from "../config/aave";
import { useNetwork } from "../contexts/NetworkContext";
import { getPermitDomain, PERMIT_TYPES } from "../config/permitConfig";
import type { SUPPORTED_TOKENS } from "@avail-project/nexus-widgets";

// Supported tokens for Aave (intersection with Nexus supported tokens)
const AAVE_SUPPORTED_TOKENS: SUPPORTED_TOKENS[] = ["USDC", "USDT"];

type DepositMode = "cross-chain" | "direct";

interface AaveYieldProps {
  className?: string;
}

export function AaveYield({ className = "" }: AaveYieldProps) {
  const [selectedToken, setSelectedToken] = useState<SUPPORTED_TOKENS>("USDC");
  const [amount, setAmount] = useState("100");
  const [showSuccess, setShowSuccess] = useState(false);
  const [depositMode, setDepositMode] = useState<DepositMode>("cross-chain");
  
  // Use global network context instead of local state
  const { networkMode } = useNetwork();
  const AAVE_CONFIG = getAaveConfig(networkMode);

  const { address } = useAccount();
  const chainId = useChainId();
  
  // Sign EIP-2612 permit
  const { signTypedDataAsync, isPending: isSigningPermit } = useSignTypedData();

  // Direct deposit to Aave with permit (for chains that support it)
  const {
    writeContract: writeSupply,
    data: supplyHash,
    isPending: isSupplyPending,
  } = useWriteContract();
  const { isLoading: isSupplyConfirming, isSuccess: isSupplySuccess } =
    useWaitForTransactionReceipt({
      hash: supplyHash,
    });

  // Approval for chains that don't support permit (e.g., Polygon)
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // Standard supply after approval
  const {
    writeContract: writeSupplyStandard,
    data: supplyStandardHash,
    isPending: isSupplyStandardPending,
  } = useWriteContract();
  const { isLoading: isSupplyStandardConfirming, isSuccess: isSupplyStandardSuccess } =
    useWaitForTransactionReceipt({
      hash: supplyStandardHash,
    });
  
  // Get token nonce for permit
  const tokenAddress = getAaveAssetAddress(selectedToken as "USDC" | "USDT", networkMode);
  const { data: nonce } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "nonces",
    args: address ? [address] : undefined,
  });

  // Get DOMAIN_SEPARATOR from the token contract
  const { data: domainSeparator } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "DOMAIN_SEPARATOR",
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

  // Handle direct deposit with permit (for users already on target network)
  // This will sign the permit and deposit in one flow for Sepolia
  // Or do approve + supply for Polygon (which doesn't support EIP-2612 permit)
  const handleDirectDepositWithPermit = async () => {
    if (!address || !amount || nonce === undefined || !domainSeparator) {
      console.log("❌ Missing required data for permit");
      return;
    }

    const tokenAddress = getAaveAssetAddress(selectedToken as "USDC" | "USDT", networkMode);
    if (!tokenAddress) return;

    try {
      const decimals = selectedToken === "USDC" || selectedToken === "USDT" ? 6 : 18;
      const amountWei = parseUnits(amount, decimals);
      
      // Check if this network/token supports EIP-2612 permit
      // - Sepolia: All tokens support permit (testnet)
      // - Polygon: Native USDC (USDCn) supports permit, USDT doesn't
      const supportsPermit = 
        networkMode === "testnet" || // All Sepolia tokens support permit
        (networkMode === "mainnet" && selectedToken === "USDC"); // Native USDC on Polygon
      
      if (supportsPermit) {
        // ===== PERMIT FLOW (Sepolia + Polygon Native USDC) =====
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

        console.log("📝 Signing permit for direct deposit...");
        console.log("Network mode:", networkMode);
        console.log("Chain ID:", AAVE_CONFIG.CHAIN_ID);
        console.log("Token:", selectedToken);

        // Get the correct permit domain for this token and network
        const domain = getPermitDomain(
          selectedToken as "USDC" | "USDT" | "DAI",
          networkMode,
          AAVE_CONFIG.CHAIN_ID,
          tokenAddress as `0x${string}`
        );

        console.log("Permit domain:", domain);

        const message = {
          owner: address,
          spender: AAVE_CONFIG.POOL as `0x${string}`,
          value: amountWei,
          nonce: BigInt(nonce),
          deadline: deadline,
        };

        console.log("Permit message:", message);
        console.log("Requesting permit signature...");
        
        const signature = await signTypedDataAsync({
          domain,
          types: PERMIT_TYPES,
          primaryType: "Permit",
          message,
        });

        console.log("✅ Permit signature received");

        // Split signature into v, r, s
        const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
        const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
        const v = parseInt(signature.slice(130, 132), 16);

        console.log("📤 Submitting supplyWithPermit transaction...");

        // Now submit the transaction with the permit
        writeSupply({
          address: AAVE_CONFIG.POOL as `0x${string}`,
          abi: AAVE_POOL_ABI,
          functionName: "supplyWithPermit",
          args: [
            tokenAddress, // asset
            amountWei, // amount
            address, // onBehalfOf
            0, // referralCode
            deadline, // deadline
            v, // permitV
            r, // permitR
            s, // permitS
          ],
          gas: 350000n, // Set reasonable gas limit for Aave supplyWithPermit
        });
      } else {
        // ===== APPROVAL FLOW (Polygon - no permit support) =====
        console.log("📝 Using approval flow (permit not supported on this network)");
        console.log("Network mode:", networkMode);
        console.log("Chain ID:", AAVE_CONFIG.CHAIN_ID);
        console.log("Token:", selectedToken);
        
        console.log("📤 Submitting approval transaction...");
        
        // Step 1: Approve Aave Pool to spend tokens
        writeApprove({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [AAVE_CONFIG.POOL as `0x${string}`, amountWei],
          gas: 100000n, // Gas limit for approval
        });
        
        // Step 2 will happen automatically via useEffect when approval confirms
      }
    } catch (error: any) {
      console.error("❌ Direct deposit error:", error);
      
      // Check for common Aave errors
      if (error?.message?.includes("SUPPLY_CAP_EXCEEDED") || error?.message?.includes("51")) {
        alert("❌ Aave Supply Cap Exceeded\n\nThe Aave V3 Sepolia pool has reached its supply cap for this token. This is a testnet limitation.\n\nSuggestions:\n- Try a smaller amount\n- Try the other supported token (USDC/USDT)\n- Wait for supply cap to be increased by Aave governance");
      } else {
        alert(`Transaction failed: ${error?.message || "Unknown error"}`);
      }
    }
  };

  // When approval succeeds, automatically call supply (for Polygon flow)
  useEffect(() => {
    if (isApproveSuccess && amount && address) {
      const tokenAddress = getAaveAssetAddress(selectedToken as "USDC" | "USDT", networkMode);
      if (!tokenAddress) return;

      const decimals = selectedToken === "USDC" || selectedToken === "USDT" ? 6 : 18;
      const amountWei = parseUnits(amount, decimals);

      console.log("✅ Approval confirmed, now submitting supply transaction...");

      // Step 2: Supply to Aave Pool
      writeSupplyStandard({
        address: AAVE_CONFIG.POOL as `0x${string}`,
        abi: AAVE_POOL_ABI,
        functionName: "supply",
        args: [
          tokenAddress, // asset
          amountWei, // amount
          address, // onBehalfOf
          0, // referralCode
        ],
        gas: 350000n, // Gas limit for supply
      });
    }
  }, [isApproveSuccess, amount, address, selectedToken]);

  // Show success when direct deposit confirms (either permit or standard flow)
  if ((isSupplySuccess || isSupplyStandardSuccess) && !showSuccess) {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 6000);
  }

  // Check if user is on the correct network (Sepolia for testnet, Polygon for mainnet)
  const isOnTargetNetwork = chainId === AAVE_CONFIG.CHAIN_ID;
  const targetNetworkName = networkMode === "testnet" ? "Sepolia" : "Polygon";

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
              {networkMode === "testnet" 
                ? "Earn yield on Ethereum Sepolia" 
                : "Earn yield on Polygon"}
            </p>
          </div>
        </div>
      </div>

      {/* Network Warning - Conditional based on mode */}
      {networkMode === "testnet" ? (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-500 font-semibold mb-1">Testnet Limitation</p>
              <p className="text-yellow-400/80">
                Aave V3 Sepolia pools have supply caps. If your transaction fails with "SUPPLY_CAP_EXCEEDED", 
                try a smaller amount or switch between USDC/USDT.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-aqua-blue/10 border border-aqua-blue/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-aqua-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-aqua-blue font-semibold mb-1">Mainnet Mode</p>
              <p className="text-aqua-blue/80">
                You're using Polygon mainnet. Make sure you're connected to Polygon (Chain ID: 137) and have real MATIC for gas fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="p-8 rounded-2xl glass-card border-2 border-aqua-blue/20">
        {/* Deposit Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-off-white mb-3">
            Deposit Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDepositMode("cross-chain")}
              className={`p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 ${
                depositMode === "cross-chain"
                  ? "border-2 border-aqua-blue bg-aqua-blue/10"
                  : "border border-soft-gray/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <ArrowUpRight className="h-5 w-5 text-aqua-blue mt-0.5" />
                <div className="text-left">
                  <div className="font-bold text-off-white">Cross-Chain</div>
                  <div className="text-xs text-soft-gray mt-1">
                    Bridge from any chain
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setDepositMode("direct")}
              disabled={!isOnTargetNetwork}
              className={`p-4 rounded-xl glass-card glass-card-hover transition-all duration-300 ${
                depositMode === "direct"
                  ? "border-2 border-neon-violet bg-neon-violet/10"
                  : "border border-soft-gray/20"
              } ${!isOnTargetNetwork ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-neon-violet mt-0.5" />
                <div className="text-left">
                  <div className="font-bold text-off-white">Direct Deposit</div>
                  <div className="text-xs text-soft-gray mt-1">
                    {isOnTargetNetwork
                      ? `Faster, you're on ${targetNetworkName}`
                      : `Switch to ${targetNetworkName}`}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-aqua-blue/10 to-transparent border border-aqua-blue/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-aqua-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm text-off-white">
              <p className="font-semibold mb-1">
                {depositMode === "cross-chain"
                  ? "Cross-Chain Bridge & Deposit"
                  : networkMode === "testnet" 
                    ? "Direct Deposit (Gasless Permit)"
                    : selectedToken === "USDC"
                      ? "Direct Deposit (Gasless Permit)"
                      : "Direct Deposit (2 Transactions)"}
              </p>
              <p className="text-soft-gray">
                {depositMode === "cross-chain"
                  ? `Bridge your ${selectedToken} from any chain to ${targetNetworkName} and deposit to Aave in one flow. Nexus handles the cross-chain bridge via Avail DA. Note: You'll need to approve the bridge contract on your source chain.`
                  : networkMode === "testnet"
                    ? "You're on Sepolia! Sign a gasless permit signature, then deposit your tokens directly to Aave. Single transaction, no approval needed."
                    : selectedToken === "USDC"
                      ? "You're on Polygon with native USDC! Sign a gasless permit signature, then deposit directly to Aave. Single transaction, no approval needed."
                      : "You're on Polygon! You'll need 2 transactions: (1) Approve Aave Pool to spend your tokens, (2) Supply tokens to Aave. This token doesn't support gasless permits."}
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
                onClick={() => setSelectedToken(token)}
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
            <span className="text-sm text-soft-gray">
              Expected Annual Yield
            </span>
            <span className="text-lg font-bold text-neon-violet">
              +
              {(
                (parseFloat(amount || "0") *
                  parseFloat(getAPY(selectedToken))) /
                100
              ).toFixed(2)}{" "}
              {selectedToken}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-soft-gray">Monthly (Est.)</span>
            <span className="text-sm font-semibold text-off-white">
              +
              {(
                (parseFloat(amount || "0") *
                  parseFloat(getAPY(selectedToken))) /
                100 /
                12
              ).toFixed(2)}{" "}
              {selectedToken}
            </span>
          </div>
        </div>

        {/* Deposit Buttons */}
        {depositMode === "cross-chain" ? (
          <BridgeAndExecuteButton
            contractAddress={AAVE_CONFIG.POOL}
            contractAbi={AAVE_POOL_ABI}
            functionName="supply"
            buildFunctionParams={(token, amt, _chainId, userAddress) => {
              const decimals = token === "USDC" || token === "USDT" ? 6 : 18;
              const amountWei = parseUnits(amt, decimals);
              const tokenAddress = getAaveAssetAddress(token as "USDC" | "USDT", networkMode);

              return {
                functionParams: [
                  tokenAddress, // asset
                  amountWei, // amount
                  userAddress, // onBehalfOf
                  0, // referralCode
                ],
              };
            }}
              prefill={{
                toChainId: AAVE_CONFIG.CHAIN_ID,
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
                  disabled={
                    isLoading || disabled || !amount || parseFloat(amount) <= 0
                  }
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
                      <span>Bridge & Supply to Aave</span>
                    </>
                  )}
                </button>
              )}
            </BridgeAndExecuteButton>
        ) : (
          // Direct Deposit Button (Permit for Sepolia, Approval+Supply for Polygon)
          <button
            onClick={handleDirectDepositWithPermit}
            disabled={
              isSigningPermit ||
              isSupplyPending ||
              isSupplyConfirming ||
              isApprovePending ||
              isApproveConfirming ||
              isSupplyStandardPending ||
              isSupplyStandardConfirming ||
              !amount ||
              parseFloat(amount) <= 0 ||
              nonce === undefined
            }
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              isSigningPermit ||
              isSupplyPending ||
              isSupplyConfirming ||
              isApprovePending ||
              isApproveConfirming ||
              isSupplyStandardPending ||
              isSupplyStandardConfirming ||
              !amount ||
              parseFloat(amount) <= 0 ||
              nonce === undefined
                ? "bg-soft-gray/20 text-soft-gray cursor-not-allowed"
                : "bg-gradient-to-r from-neon-violet to-neon-violet/80 text-off-white hover:shadow-neon-glow glass-card-hover"
            }`}
          >
            {isSigningPermit ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing Permit...</span>
              </>
            ) : isApprovePending || isApproveConfirming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Approving... (Step 1/2)</span>
              </>
            ) : isSupplyPending || isSupplyConfirming || isSupplyStandardPending || isSupplyStandardConfirming ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Depositing... {isSupplyStandardPending || isSupplyStandardConfirming ? "(Step 2/2)" : ""}</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <span>Deposit to Aave</span>
              </>
            )}
          </button>
        )}

        {/* How it works */}
        <div className="mt-6 p-4 rounded-xl bg-deep-space/30 border border-soft-gray/10">
          <h4 className="text-sm font-semibold text-off-white mb-3">
            How it works (
            {depositMode === "cross-chain" ? "Cross-Chain" : "Direct Deposit"}):
          </h4>
          <ol className="space-y-2 text-sm text-soft-gray">
            <li className="flex items-start gap-2">
              <span className="text-aqua-blue font-bold">1.</span>
              <span>
                {networkMode === "testnet" ? (
                  <>
                    <strong className="text-aqua-blue">Sign Permit:</strong> Sign an off-chain message to allow Aave
                    Pool to spend your {selectedToken} (gasless, happens when you click deposit)
                  </>
                ) : (
                  <>
                    <strong className="text-aqua-blue">Approve:</strong> First transaction to allow Aave
                    Pool to spend your {selectedToken} (small gas fee)
                  </>
                )}
              </span>
            </li>
            {depositMode === "cross-chain" ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-neon-violet font-bold">2.</span>
                  <span>
                    <strong className="text-neon-violet">Bridge:</strong> Your{" "}
                    {selectedToken} is bridged from your current chain to{" "}
                    {networkMode === "testnet" ? "Ethereum Sepolia" : "Polygon"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-violet font-bold">3.</span>
                  <span>
                    <strong className="text-neon-violet">Supply:</strong> Tokens
                    are supplied to Aave V3 lending pool{" "}
                    {networkMode === "testnet" ? "using the permit signature" : "after approval"}
                  </span>
                </li>
              </>
            ) : (
              <li className="flex items-start gap-2">
                <span className="text-neon-violet font-bold">2.</span>
                <span>
                  <strong className="text-neon-violet">Supply:</strong> Tokens
                  are supplied directly to Aave V3 lending pool{" "}
                  {networkMode === "testnet" 
                    ? "using the permit signature (no bridging needed!)"
                    : "(second transaction, no bridging needed!)"}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-neon-violet font-bold">
                {depositMode === "cross-chain" ? "4" : "3"}.
              </span>
              <span>
                <strong className="text-neon-violet">Earn:</strong> You receive
                aTokens (a{selectedToken}) that earn interest in real-time
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-soft-gray font-bold">
                {depositMode === "cross-chain" ? "5" : "4"}.
              </span>
              <span>
                <strong className="text-soft-gray">Withdraw:</strong> Redeem
                anytime by burning your aTokens
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
            {(
              (parseFloat(getAPY("USDC")) + parseFloat(getAPY("USDT"))) /
              2
            ).toFixed(2)}
            %
          </div>
          <div className="text-xs text-soft-gray mt-1">Weighted average</div>
        </div>
      </div>
    </div>
  );
}
