/**
 * EIP-2612 Permit Domain Configuration
 * 
 * Different chains use different domain parameters for USDC and other tokens.
 * This file maintains the correct parameters for each token on each chain.
 * 
 * Reference: https://eips.ethereum.org/EIPS/eip-2612
 */

import type { NetworkMode } from "../contexts/NetworkContext";

export interface PermitDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

/**
 * Token permit domain configurations by chain
 */
export const TOKEN_PERMIT_DOMAINS = {
  // Sepolia Testnet
  sepolia: {
    USDC: {
      name: "USDC",
      version: "1",
    },
    USDT: {
      name: "Tether USD", 
      version: "1",
    },
    DAI: {
      name: "Dai Stablecoin",
      version: "1",
    },
  },
  
  // Polygon Mainnet
  polygon: {
    USDC: {
      // Native USDC (USDCn) - supports EIP-2612 permit
      // Address: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
      name: "USD Coin",
      version: "2",
    },
    USDT: {
      // Polygon USDT (bridged) - does NOT support permit
      name: "(PoS) Tether USD",
      version: "1",
    },
    DAI: {
      // Polygon DAI (bridged)
      name: "(PoS) Dai Stablecoin",
      version: "1",
    },
  },
} as const;

/**
 * Get the correct permit domain for a token on a specific network
 */
export function getPermitDomain(
  token: "USDC" | "USDT" | "DAI",
  networkMode: NetworkMode,
  chainId: number,
  verifyingContract: `0x${string}`
): PermitDomain {
  const network = networkMode === "mainnet" ? "polygon" : "sepolia";
  const tokenConfig = TOKEN_PERMIT_DOMAINS[network][token];
  
  return {
    name: tokenConfig.name,
    version: tokenConfig.version,
    chainId,
    verifyingContract,
  };
}

/**
 * Check if a token supports permit on a given network
 */
export function supportsPermit(
  token: string,
  networkMode: NetworkMode
): boolean {
  const network = networkMode === "mainnet" ? "polygon" : "sepolia";
  return token in TOKEN_PERMIT_DOMAINS[network];
}

/**
 * Permit type definition for EIP-712
 */
export const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;
