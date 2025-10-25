// Popular token addresses for each supported chain
// Used for dropdown selection in swap node configuration

export const POPULAR_TOKENS = {
  // Base Mainnet
  base: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    }, // Native ETH
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    {
      symbol: "USDbC",
      name: "USD Base Coin",
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      decimals: 18,
    },
    {
      symbol: "cbBTC",
      name: "Coinbase Wrapped BTC",
      address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      decimals: 8,
    },
  ],

  // Ethereum Mainnet
  ethereum: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      symbol: "WBTC",
      name: "Wrapped BTC",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      decimals: 8,
    },
  ],

  // Polygon Mainnet
  polygon: [
    {
      symbol: "MATIC",
      name: "Polygon",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WMATIC",
      name: "Wrapped Matic",
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
    },
  ],

  // Arbitrum Mainnet
  arbitrum: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
    },
    {
      symbol: "ARB",
      name: "Arbitrum",
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18,
    },
  ],

  // Optimism Mainnet
  optimism: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
    },
    {
      symbol: "OP",
      name: "Optimism",
      address: "0x4200000000000000000000000000000000000042",
      decimals: 18,
    },
  ],

  // BNB Chain Mainnet
  bnb: [
    {
      symbol: "BNB",
      name: "BNB",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WBNB",
      name: "Wrapped BNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      decimals: 18,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
    {
      symbol: "BUSD",
      name: "Binance USD",
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      decimals: 18,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      decimals: 18,
    },
  ],

  // Avalanche Mainnet
  avalanche: [
    {
      symbol: "AVAX",
      name: "Avalanche",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WAVAX",
      name: "Wrapped AVAX",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      decimals: 18,
    },
  ],

  // Celo Mainnet
  celo: [
    {
      symbol: "CELO",
      name: "Celo",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "cUSD",
      name: "Celo Dollar",
      address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      decimals: 18,
    },
    {
      symbol: "cEUR",
      name: "Celo Euro",
      address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      decimals: 6,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207",
      decimals: 18,
    },
  ],

  // Sepolia Testnet
  sepolia: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      decimals: 18,
    },
  ],

  // Base Sepolia Testnet
  basesepolia: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
    {
      symbol: "USDC",
      name: "USD Coin (Mock)",
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      decimals: 6,
    },
  ],

  // Arbitrum Sepolia
  arbitrumsepolia: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
      decimals: 18,
    },
  ],

  // Optimism Sepolia
  optimismsepolia: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  ],

  // Avalanche Fuji Testnet
  avalanchefuji: [
    {
      symbol: "AVAX",
      name: "Avalanche",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WAVAX",
      name: "Wrapped AVAX",
      address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
      decimals: 18,
    },
  ],

  // Polygon Mumbai Testnet
  polygonmumbai: [
    {
      symbol: "MATIC",
      name: "Polygon",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: 18,
    },
    {
      symbol: "WMATIC",
      name: "Wrapped Matic",
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      decimals: 18,
    },
  ],
};

// Helper function to get tokens for a specific chain
export function getTokensForChain(chainName: string) {
  return POPULAR_TOKENS[chainName as keyof typeof POPULAR_TOKENS] || [];
}

// Helper function to find token by address
export function findTokenByAddress(chainName: string, address: string) {
  const tokens = getTokensForChain(chainName);
  return tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
}

// Check if address is a custom address (not in popular tokens list)
export function isCustomToken(chainName: string, address: string) {
  return !findTokenByAddress(chainName, address);
}
