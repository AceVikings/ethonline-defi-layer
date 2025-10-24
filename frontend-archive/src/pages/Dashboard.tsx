import { Network, Shield, Zap, Activity, ExternalLink } from 'lucide-react';

// Avail Nexus supported testnets
const AVAIL_TESTNETS = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    logo: 'https://assets.coingecko.com/asset_platforms/images/279/large/ethereum.png',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io',
    tokens: ['ETH', 'USDC', 'USDT']
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    logo: 'https://pbs.twimg.com/profile_images/1945608199500910592/rnk6ixxH_400x400.jpg',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://sepolia.basescan.org',
    tokens: ['ETH', 'USDC', 'USDT']
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    logo: 'https://assets.coingecko.com/coins/images/16547/large/arb.jpg',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://sepolia.arbiscan.io',
    tokens: ['ETH', 'USDC', 'USDT']
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    tokens: ['ETH', 'USDC', 'USDT']
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
    nativeCurrency: 'MATIC',
    blockExplorer: 'https://amoy.polygonscan.com',
    tokens: ['POL', 'USDC', 'USDT']
  },
  {
    id: 10143,
    name: 'Monad Testnet',
    logo: 'https://assets.coingecko.com/coins/images/38927/standard/monad.jpg',
    nativeCurrency: 'MON',
    blockExplorer: 'https://explorer.testnet.monad.xyz',
    tokens: ['MON', 'USDC', 'USDT']
  }
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <h1 
            className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="block text-off-white">AlphaFlow</span>
            <span className="block gradient-text mt-2">Dashboard</span>
          </h1>
          
          <p className="text-lg text-soft-gray max-w-2xl mx-auto leading-relaxed font-light">
            Autonomous multi-chain DeFi powered by Avail Nexus
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-6 rounded-xl glass-card border border-neon-violet/20">
            <div className="text-sm text-soft-gray mb-2">Total Networks</div>
            <div className="text-3xl font-bold text-neon-violet">6</div>
            <div className="text-xs text-soft-gray mt-1">Testnets Live</div>
          </div>
          <div className="p-6 rounded-xl glass-card border border-aqua-blue/20">
            <div className="text-sm text-soft-gray mb-2">Supported Tokens</div>
            <div className="text-3xl font-bold text-aqua-blue">6</div>
            <div className="text-xs text-soft-gray mt-1">ETH, USDC, USDT, POL, MON</div>
          </div>
          <div className="p-6 rounded-xl glass-card border border-magenta-haze/20">
            <div className="text-sm text-soft-gray mb-2">Active Protocols</div>
            <div className="text-3xl font-bold text-magenta-haze">2</div>
            <div className="text-xs text-soft-gray mt-1">Aave V3 + Compound V3</div>
          </div>
        </div>
      </div>

      {/* Networks Grid */}
      <div>
        <h2 
          className="text-2xl font-bold text-off-white mb-6" 
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          Supported Networks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAIL_TESTNETS.map((testnet) => (
            <div
              key={testnet.id}
              className="p-6 rounded-2xl glass-card border-2 border-soft-gray/10 hover:border-neon-violet/30 transition-all duration-300 hover:shadow-neon-glow group"
            >
              {/* Header with Logo */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-soft-gray/10 to-transparent border border-soft-gray/20 flex items-center justify-center">
                  <img
                    src={testnet.logo}
                    alt={testnet.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23333"/></svg>';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-off-white group-hover:text-neon-violet transition-colors">
                    {testnet.name}
                  </h3>
                  <p className="text-sm text-soft-gray">Chain ID: {testnet.id}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Native Currency */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-aqua-blue/10 to-transparent border border-aqua-blue/20">
                  <Zap className="h-4 w-4 text-aqua-blue" />
                  <span className="text-sm text-aqua-blue font-medium">{testnet.nativeCurrency}</span>
                </div>

                {/* Supported Tokens */}
                <div className="space-y-2">
                  <p className="text-xs text-soft-gray uppercase tracking-wider">Supported Tokens</p>
                  <div className="flex flex-wrap gap-2">
                    {testnet.tokens.map((token) => (
                      <span 
                        key={token}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-br from-magenta-haze/20 to-transparent border border-magenta-haze/30 text-magenta-haze"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explorer Link */}
                <a
                  href={testnet.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-soft-gray hover:text-neon-violet transition-colors duration-200"
                >
                  <Activity className="h-4 w-4" />
                  <span>Block Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-8 rounded-2xl glass-card border-2 border-aqua-blue/20">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-aqua-blue/30 to-aqua-blue/10 flex items-center justify-center border-2 border-aqua-blue/30 glow-cyan">
            <Network className="h-8 w-8 text-aqua-blue" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-2xl font-bold text-off-white" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
              Unified Liquidity via Avail Nexus
            </h3>
            <p className="text-soft-gray leading-relaxed">
              AlphaFlow connects all 6 testnets through Avail Nexus SDK, enabling seamless 
              cross-chain balance aggregation, bridging, and DeFi interactions. Earn yield 
              on any chain, bridge automatically, and maximize returns with autonomous strategies.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-aqua-blue" />
                <span className="text-sm text-soft-gray">Trustless</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-aqua-blue" />
                <span className="text-sm text-soft-gray">Fast Bridging</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-aqua-blue" />
                <span className="text-sm text-soft-gray">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
