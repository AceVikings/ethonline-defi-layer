// Aave V3 token addresses for supported chains
// Source: https://docs.aave.com/developers/deployed-contracts/v3-mainnet

export const AAVE_TOKENS = {
  // Base Mainnet
  base: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    WETH: "0x4200000000000000000000000000000000000006",
    cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
  },

  // Base Sepolia (Testnet)
  basesepolia: {
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    WETH: "0x4200000000000000000000000000000000000006",
    DAI: "0x7683022d84f726a96c4a6611cd31dbbf5d7c6b0f",
  },

  // Ethereum Mainnet
  ethereum: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },

  // Sepolia (Testnet)
  sepolia: {
    USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    WETH: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
    DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    LINK: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
  },

  // Polygon Mainnet
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  },

  // Arbitrum Mainnet
  arbitrum: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
  },

  // Arbitrum Sepolia (Testnet)
  arbitrumsepolia: {
    USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    WETH: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    DAI: "0x7683022d84f726a96c4a6611cd31dbbf5d7c6b0f",
  },

  // Optimism Mainnet
  optimism: {
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    WETH: "0x4200000000000000000000000000000000000006",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    LINK: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
  },

  // Optimism Sepolia (Testnet)
  optimismsepolia: {
    USDC: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    WETH: "0x4200000000000000000000000000000000000006",
    DAI: "0x7683022d84f726a96c4a6611cd31dbbf5d7c6b0f",
  },

  // Avalanche Mainnet
  avalanche: {
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
  },

  // Avalanche Fuji (Testnet)
  avalanchefuji: {
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
    WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    WETH: "0x7683022d84f726a96c4a6611cd31dbbf5d7c6b0f",
  },
};

/**
 * Resolve token symbol to contract address for Aave operations
 * @param {string} chainName - Chain name (e.g., "base", "basesepolia")
 * @param {string} tokenSymbolOrAddress - Token symbol (e.g., "USDC") or address (0x...)
 * @returns {string} Token contract address
 */
export function resolveAaveToken(chainName, tokenSymbolOrAddress) {
  // If already an address (starts with 0x), return as-is
  if (tokenSymbolOrAddress.startsWith("0x")) {
    return tokenSymbolOrAddress;
  }

  // Try to resolve symbol to address
  const chainTokens = AAVE_TOKENS[chainName];
  if (!chainTokens) {
    throw new Error(
      `Unsupported chain for Aave: ${chainName}. Supported chains: ${Object.keys(
        AAVE_TOKENS
      ).join(", ")}`
    );
  }

  const tokenAddress = chainTokens[tokenSymbolOrAddress.toUpperCase()];
  if (!tokenAddress) {
    throw new Error(
      `Token ${tokenSymbolOrAddress} not found on ${chainName}. Available tokens: ${Object.keys(
        chainTokens
      ).join(", ")}`
    );
  }

  return tokenAddress;
}

/**
 * Get list of supported tokens for a chain
 * @param {string} chainName - Chain name
 * @returns {string[]} Array of token symbols
 */
export function getAaveTokensForChain(chainName) {
  const chainTokens = AAVE_TOKENS[chainName];
  if (!chainTokens) {
    return [];
  }
  return Object.keys(chainTokens);
}
