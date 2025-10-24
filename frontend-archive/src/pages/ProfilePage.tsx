import { useAccount } from 'wagmi';
import { Wallet2, TrendingUp, Activity } from 'lucide-react';
import { UnifiedBalance } from '../components/UnifiedBalance';

export function ProfilePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 
            className="text-3xl lg:text-4xl font-bold text-off-white mb-2" 
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Profile
          </h1>
          <p className="text-soft-gray">
            View your balances and activity across all chains
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center p-12 rounded-2xl glass-card border-2 border-neon-violet/20 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
              <Wallet2 className="h-10 w-10 text-neon-violet" />
            </div>
            <h3 
              className="text-2xl font-bold text-off-white mb-3"
              style={{ fontFamily: 'Inter Tight, sans-serif' }}
            >
              Connect Your Wallet
            </h3>
            <p className="text-soft-gray">
              Connect your wallet to view your unified balances and track your positions across all chains.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 
          className="text-3xl lg:text-4xl font-bold text-off-white mb-2" 
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Profile
        </h1>
        <p className="text-soft-gray">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl glass-card border border-aqua-blue/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aqua-blue/30 to-aqua-blue/10 flex items-center justify-center">
              <Wallet2 className="h-5 w-5 text-aqua-blue" />
            </div>
            <div className="text-sm text-soft-gray">Total Balance</div>
          </div>
          <div className="text-2xl font-bold text-off-white">$0.00</div>
          <div className="text-xs text-soft-gray mt-1">Across all chains</div>
        </div>
        
        <div className="p-6 rounded-xl glass-card border border-neon-violet/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-neon-violet" />
            </div>
            <div className="text-sm text-soft-gray">Total Yield</div>
          </div>
          <div className="text-2xl font-bold text-neon-violet">$0.00</div>
          <div className="text-xs text-soft-gray mt-1">Lifetime earnings</div>
        </div>
        
        <div className="p-6 rounded-xl glass-card border border-magenta-haze/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-magenta-haze/30 to-magenta-haze/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-magenta-haze" />
            </div>
            <div className="text-sm text-soft-gray">Active Positions</div>
          </div>
          <div className="text-2xl font-bold text-magenta-haze">0</div>
          <div className="text-xs text-soft-gray mt-1">Across protocols</div>
        </div>
      </div>

      {/* Unified Balance */}
      <div>
        <h2 
          className="text-2xl font-bold text-off-white mb-4" 
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          Unified Balances
        </h2>
        <UnifiedBalance />
      </div>

      {/* Activity Section (Placeholder) */}
      <div>
        <h2 
          className="text-2xl font-bold text-off-white mb-4" 
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          Recent Activity
        </h2>
        <div className="p-8 rounded-xl glass-card border border-soft-gray/20 text-center">
          <Activity className="h-12 w-12 text-soft-gray mx-auto mb-4" />
          <p className="text-soft-gray">No recent activity</p>
          <p className="text-sm text-soft-gray/70 mt-2">
            Your transactions and DeFi interactions will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
