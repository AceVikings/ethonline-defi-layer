/**
 * Network Context
 * Provides global network mode state (testnet/mainnet) for the entire application
 * This affects Aave, Avail, and RainbowKit configurations
 */

import { createContext, useContext, useState, type ReactNode } from "react";
import { testnetChains, mainnetChains } from "../config/wagmi";

export type NetworkMode = "testnet" | "mainnet";

interface NetworkContextType {
  networkMode: NetworkMode;
  setNetworkMode: (mode: NetworkMode) => void;
  isTestnet: boolean;
  isMainnet: boolean;
  availableChains: readonly any[];
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [networkMode, setNetworkMode] = useState<NetworkMode>("testnet");

  const value: NetworkContextType = {
    networkMode,
    setNetworkMode,
    isTestnet: networkMode === "testnet",
    isMainnet: networkMode === "mainnet",
    availableChains: networkMode === "mainnet" ? mainnetChains : testnetChains,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}

/**
 * Get network-specific configuration
 */
export function useNetworkConfig() {
  const { networkMode, isTestnet, isMainnet, availableChains } = useNetwork();

  return {
    networkMode,
    isTestnet,
    isMainnet,
    availableChains,
    // Avail Nexus - Primary target chain for deposits
    availChainId: isMainnet ? 137 : 11155111, // Polygon mainnet : Sepolia testnet
    availChainName: isMainnet ? "Polygon" : "Sepolia",
    // RainbowKit
    defaultChain: isMainnet ? 137 : 11155111,
    // Supported chain IDs for filtering
    supportedChainIds: isMainnet 
      ? [1, 137, 42161, 10, 8453] // Ethereum, Polygon, Arbitrum, Optimism, Base
      : [11155111, 80002, 84532, 421614, 11155420, 10143], // Sepolia, Polygon Amoy, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Monad
  };
}
