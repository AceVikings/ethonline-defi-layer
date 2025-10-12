import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Network, Cpu, Shield, Zap, Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      {/* Animated Network Flow Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          {/* Network Nodes */}
          <circle cx="10%" cy="20%" r="3" fill="url(#flowGradient)" className="flow-node" />
          <circle cx="90%" cy="30%" r="3" fill="url(#flowGradient)" className="flow-node" style={{ animationDelay: '1s' }} />
          <circle cx="20%" cy="80%" r="3" fill="url(#flowGradient)" className="flow-node" style={{ animationDelay: '2s' }} />
          <circle cx="80%" cy="70%" r="3" fill="url(#flowGradient)" className="flow-node" style={{ animationDelay: '1.5s' }} />
          <circle cx="50%" cy="50%" r="4" fill="url(#flowGradient)" className="flow-node" style={{ animationDelay: '0.5s' }} />
          
          {/* Connecting Lines */}
          <line x1="10%" y1="20%" x2="50%" y2="50%" stroke="url(#flowGradient)" strokeWidth="1" className="flow-line" />
          <line x1="90%" y1="30%" x2="50%" y2="50%" stroke="url(#flowGradient)" strokeWidth="1" className="flow-line" />
          <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="url(#flowGradient)" strokeWidth="1" className="flow-line" />
          <line x1="80%" y1="70%" x2="50%" y2="50%" stroke="url(#flowGradient)" strokeWidth="1" className="flow-line" />
        </svg>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-deep-navy/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-violet to-aqua-blue opacity-20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-aqua-blue flex items-center justify-center">
                  <Network className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  NeuraFlow
                </h1>
                <p className="text-[10px] text-soft-gray uppercase tracking-wider">Liquidity Intelligence</p>
              </div>
            </div>

            {/* Network Status Pill */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-blue opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-blue" />
                </div>
                <span className="text-sm text-off-white font-medium" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                  Network Live
                </span>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32 lg:py-40">
          <div className="text-center max-w-5xl mx-auto space-y-10">
            {/* Main Headline */}
            <div className="space-y-8">
              <h2 
                className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <span className="block text-off-white">Unifying liquidity</span>
                <span className="block gradient-text mt-2">intelligence</span>
                <span className="block text-off-white mt-2">across chains</span>
              </h2>
              
              <p className="text-lg lg:text-xl text-soft-gray max-w-2xl mx-auto leading-relaxed font-light pt-4">
                Powered by agents, proofs, and user sovereignty
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button className="group relative px-8 py-4 rounded-xl overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-violet to-aqua-blue opacity-100 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-neon-violet to-aqua-blue opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative flex items-center gap-2 text-white font-semibold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                  Launch App
                  <Zap className="h-4 w-4" />
                </span>
              </button>
              
              <button className="px-8 py-4 rounded-xl glass-card glass-card-hover transition-all duration-300 text-off-white font-semibold" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                View Documentation
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12">
              <p className="text-sm text-soft-gray/70 mb-6 uppercase tracking-wider" style={{ fontSize: '11px' }}>
                Built on leading infrastructure
              </p>
              <div className="flex items-center justify-center gap-10 opacity-50">
                <span className="text-sm font-medium text-off-white">Hedera</span>
                <span className="text-sm font-medium text-off-white">Avail</span>
                <span className="text-sm font-medium text-off-white">LIT Protocol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Panels - Floating Modular Design */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Agents Panel */}
            <div 
              className="group relative p-8 rounded-2xl glass-card glass-card-hover transition-all duration-500 float border-2"
              style={{ 
                transform: 'perspective(1000px) rotateY(-1deg)',
                transformStyle: 'preserve-3d',
                borderColor: 'rgba(124, 58, 237, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-violet/10 flex items-center justify-center border-2 border-neon-violet/30 glow-violet">
                  <Cpu className="h-8 w-8 text-neon-violet" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-off-white" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                    AI Agents
                  </h3>
                  <p className="text-soft-gray leading-relaxed">
                    Autonomous agents communicate via A2A protocol to execute arbitrage, rebalancing, and risk management across chains
                  </p>
                </div>

                {/* Subtle Flow Indicator */}
                <div className="pt-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-neon-violet/50" />
                  <div className="h-px flex-1 bg-gradient-to-r from-neon-violet/50 to-transparent" />
                </div>
              </div>
            </div>

            {/* Cross-Chain Proofs Panel */}
            <div 
              className="group relative p-8 rounded-2xl glass-card glass-card-hover transition-all duration-500 float border-2"
              style={{ 
                transform: 'perspective(1000px) rotateY(0deg)',
                transformStyle: 'preserve-3d',
                animationDelay: '0.2s',
                borderColor: 'rgba(6, 182, 212, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-aqua-blue/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-aqua-blue/30 to-aqua-blue/10 flex items-center justify-center border-2 border-aqua-blue/30 glow-cyan">
                  <Shield className="h-8 w-8 text-aqua-blue" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-off-white" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                    Cross-Chain Proofs
                  </h3>
                  <p className="text-soft-gray leading-relaxed">
                    Avail DA layer provides tamper-proof state verification and data availability for secure multi-chain operations
                  </p>
                </div>

                {/* Subtle Flow Indicator */}
                <div className="pt-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-aqua-blue/50" />
                  <div className="h-px flex-1 bg-gradient-to-r from-aqua-blue/50 to-transparent" />
                </div>
              </div>
            </div>

            {/* User Control Panel */}
            <div 
              className="group relative p-8 rounded-2xl glass-card glass-card-hover transition-all duration-500 float border-2"
              style={{ 
                transform: 'perspective(1000px) rotateY(1deg)',
                transformStyle: 'preserve-3d',
                animationDelay: '0.4s',
                borderColor: 'rgba(232, 121, 249, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-magenta-haze/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-magenta-haze/30 to-magenta-haze/10 flex items-center justify-center border-2 border-magenta-haze/30" style={{ boxShadow: '0 0 30px rgba(232, 121, 249, 0.15)' }}>
                  <Network className="h-8 w-8 text-magenta-haze" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-off-white" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
                    User Control
                  </h3>
                  <p className="text-soft-gray leading-relaxed">
                    LIT Protocol PKPs ensure programmable key pairs with user-controlled signing and custom permission policies
                  </p>
                </div>

                {/* Subtle Flow Indicator */}
                <div className="pt-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-magenta-haze/50" />
                  <div className="h-px flex-1 bg-gradient-to-r from-magenta-haze/50 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-deep-navy/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-violet to-aqua-blue flex items-center justify-center">
                <Network className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  NeuraFlow
                </h2>
                <p className="text-[10px] text-soft-gray">Cross-Chain Liquidity Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-soft-gray/70">
              © 2025 NeuraFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
